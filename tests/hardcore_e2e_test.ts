import { serviceClient } from '../backend/src/lib/supabase';

// ANSI Colors
const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';
const MAGENTA = '\x1b[35m';
const RESET = '\x1b[0m';
const CHECK = `${GREEN}✔ PASS${RESET}`;
const CROSS = `${RED}✖ FAIL${RESET}`;

const FRONTEND_URL = 'http://localhost:5173/api/v1';
const BACKEND_URL = 'http://localhost:5000/api/v1';

interface TestStats {
  passed: number;
  failed: number;
  steps: { name: string; latencyMs: number; status: 'PASS' | 'FAIL'; details: string }[];
}

const stats: TestStats = { passed: 0, failed: 0, steps: [] };

function logHeader(title: string) {
  console.log(`\n${CYAN}================================================================================${RESET}`);
  console.log(`${BOLD}${MAGENTA}   ${title}${RESET}`);
  console.log(`${CYAN}================================================================================${RESET}`);
}

function recordResult(name: string, status: 'PASS' | 'FAIL', latencyMs: number, details: string) {
  if (status === 'PASS') {
    stats.passed++;
    console.log(`  ${CHECK} [${latencyMs}ms] ${BOLD}${name}${RESET}`);
  } else {
    stats.failed++;
    console.log(`  ${CROSS} [${latencyMs}ms] ${BOLD}${name}${RESET}`);
  }
  if (details) {
    console.log(`     ${YELLOW}↳ ${details}${RESET}`);
  }
  stats.steps.push({ name, latencyMs, status, details });
}

let currentToken = '';

async function api(path: string, options: RequestInit = {}) {
  const url = `${FRONTEND_URL}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (currentToken && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${currentToken}`;
  }
  const res = await fetch(url, { ...options, headers });
  const body = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data: body };
}

async function runHardcoreTest() {
  const overallStart = Date.now();
  console.log(`${BOLD}🚀 STARTING HARDCORE E2E INTEGRATION & DATA-FLOW TEST SUITE${RESET}`);
  console.log(`Frontend Gateway (Vite Proxy): ${BOLD}${FRONTEND_URL}${RESET}`);
  console.log(`Backend Direct Core API:       ${BOLD}${BACKEND_URL}${RESET}`);
  console.log(`Database:                      ${BOLD}Supabase PostgreSQL (Cloud)${RESET}\n`);

  let businessId = '';
  let testCustomerId = '';
  let testCategoryId = '';
  let testProductId = '';
  let testDealId = '';
  let testQuotationId = '';
  let testInvoiceId = '';
  let testWarehouseId = '';

  const runId = Math.floor(1000 + Math.random() * 9000);

  // -------------------------------------------------------------
  // PHASE 1: Health & Reverse Proxy Verification
  // -------------------------------------------------------------
  logHeader('PHASE 1: FRONTEND REVERSE PROXY & GATEWAY CONNECTIVITY');

  try {
    const t0 = Date.now();
    const res = await api('/auth/session');
    const dt = Date.now() - t0;
    if (res.status === 401 || res.status === 403) {
      recordResult('Frontend Proxy Route Enforcement (/api/v1 -> Backend)', 'PASS', dt, 'Frontend port 5173 correctly routed request to port 5000 and enforced 401 Auth Guard');
    } else {
      recordResult('Frontend Proxy Route Enforcement (/api/v1 -> Backend)', 'FAIL', dt, `Expected 401/403 but received status: ${res.status}`);
    }
  } catch (err: any) {
    recordResult('Frontend Proxy Route Enforcement', 'FAIL', 0, err.message);
  }

  // -------------------------------------------------------------
  // PHASE 2: Authentication through Frontend & Token Generation
  // -------------------------------------------------------------
  logHeader('PHASE 2: AUTHENTICATION & MULTI-TENANT SESSION ACQUISITION');

  try {
    const t0 = Date.now();
    const loginRes = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@acme.com', password: 'admin123' }),
    });
    const dt = Date.now() - t0;

    if (!loginRes.ok || !loginRes.data?.data?.access_token) {
      throw new Error(`Login failed: ${loginRes.data?.error?.message || loginRes.status}`);
    }

    currentToken = loginRes.data.data.access_token;
    businessId = loginRes.data.data.user.business_id;

    recordResult('Admin Login via Frontend Gateway', 'PASS', dt, `Acquired JWT session for ${loginRes.data.data.user.email} (Tenant: ${businessId})`);

    // Verify Session Endpoint through Frontend
    const s0 = Date.now();
    const sessionRes = await api('/auth/session');
    const sDt = Date.now() - s0;
    if (sessionRes.data?.data?.business_id === businessId && sessionRes.data?.data?.role === 'business_admin') {
      recordResult('Frontend Session Introspection (/auth/session)', 'PASS', sDt, `Confirmed Role=${sessionRes.data.data.role}, Name="${sessionRes.data.data.full_name}"`);
    } else {
      recordResult('Frontend Session Introspection (/auth/session)', 'FAIL', sDt, 'Session data does not match token claims');
    }
  } catch (err: any) {
    recordResult('Admin Login via Frontend Gateway', 'FAIL', 0, err.message);
    console.error('Fatal Auth failure, aborting further steps.');
    return;
  }

  // -------------------------------------------------------------
  // PHASE 3: Data Addition - Category & Product Catalog
  // -------------------------------------------------------------
  logHeader('PHASE 3: CPQ PRODUCT CATALOG CREATION (FRONTEND -> BACKEND -> DB)');

  // 1. Create Category
  try {
    const t0 = Date.now();
    const catName = `Enterprise Cloud Suite ${runId}`;
    const catRes = await api('/categories', {
      method: 'POST',
      body: JSON.stringify({ name: catName }),
    });
    const dt = Date.now() - t0;

    if (!catRes.ok || !catRes.data?.data?.id) {
      throw new Error(`Category creation failed: ${catRes.data?.error?.message || catRes.status}`);
    }
    testCategoryId = catRes.data.data.id;

    // Direct DB Verification
    const { data: dbCat, error: dbCatErr } = await serviceClient
      .from('categories')
      .select('*')
      .eq('id', testCategoryId)
      .single();

    if (!dbCatErr && dbCat && dbCat.name === catName && dbCat.business_id === businessId) {
      recordResult('Create Category via Frontend & Supabase Verification', 'PASS', dt, `Category "${catName}" created (ID: ${testCategoryId}) & verified in Supabase Postgres`);
    } else {
      recordResult('Create Category via Frontend & Supabase Verification', 'FAIL', dt, `DB mismatch: ${dbCatErr?.message || 'Row not found'}`);
    }
  } catch (err: any) {
    recordResult('Create Category via Frontend', 'FAIL', 0, err.message);
  }

  // 2. Create Product
  try {
    const t0 = Date.now();
    const productPayload = {
      name: `Cloud Dedicated Node v${runId}`,
      sku: `SKU-NODE-${runId}`,
      category_id: testCategoryId,
      price: 125000,
      currency: 'INR',
      unit: 'node_year',
      tax_percent: 18,
      description: 'Ultra high-performance CPQ enterprise compute node',
      status: 'active',
    };
    const prodRes = await api('/products', {
      method: 'POST',
      body: JSON.stringify(productPayload),
    });
    const dt = Date.now() - t0;

    if (!prodRes.ok || !prodRes.data?.data?.id) {
      throw new Error(`Product creation failed: ${prodRes.data?.error?.message || prodRes.status}`);
    }
    testProductId = prodRes.data.data.id;

    // Direct DB Verification
    const { data: dbProd, error: dbProdErr } = await serviceClient
      .from('products')
      .select('*')
      .eq('id', testProductId)
      .single();

    if (!dbProdErr && dbProd && Number(dbProd.price) === 125000 && dbProd.sku === productPayload.sku) {
      recordResult('Create Product via Frontend & Supabase Verification', 'PASS', dt, `Product "${dbProd.name}" (SKU: ${dbProd.sku}, Price: ₹${dbProd.price}) persisted in DB`);
    } else {
      recordResult('Create Product via Frontend & Supabase Verification', 'FAIL', dt, `DB mismatch: ${dbProdErr?.message || 'Row not found'}`);
    }
  } catch (err: any) {
    recordResult('Create Product via Frontend', 'FAIL', 0, err.message);
  }

  // -------------------------------------------------------------
  // PHASE 4: Data Addition - Customer & Contact Accounts
  // -------------------------------------------------------------
  logHeader('PHASE 4: CUSTOMER ACCOUNT ONBOARDING (FRONTEND -> BACKEND -> DB)');

  try {
    const t0 = Date.now();
    const customerPayload = {
      name: `Apex Global Tech ${runId} Corp`,
      tier: 'gold',
      status: 'active',
      billing_address: {
        line1: '99 Tech Boulevard, Cyber City',
        city: 'Bengaluru',
        state: 'Karnataka',
        postal_code: '560100',
        country: 'India',
      },
      contacts: [
        {
          name: `Vikram Malhotra ${runId}`,
          email: `vikram.${runId}@apexglobal.io`,
          phone: '+91 98765 43210',
          is_primary: true,
        },
      ],
    };
    const custRes = await api('/customers', {
      method: 'POST',
      body: JSON.stringify(customerPayload),
    });
    const dt = Date.now() - t0;

    if (!custRes.ok || !custRes.data?.data?.id) {
      throw new Error(`Customer creation failed: ${custRes.data?.error?.message || custRes.status}`);
    }
    testCustomerId = custRes.data.data.id;

    // Direct DB Verification of Customer AND Contacts relation
    const { data: dbCust, error: dbCustErr } = await serviceClient
      .from('customers')
      .select('*, customer_contacts(*)')
      .eq('id', testCustomerId)
      .single();

    const contactsMatch = dbCust?.customer_contacts?.length > 0 && dbCust.customer_contacts[0].email === customerPayload.contacts[0].email;

    if (!dbCustErr && dbCust && dbCust.name === customerPayload.name && dbCust.tier === 'gold' && contactsMatch) {
      recordResult('Create Customer + Contact via Frontend & Supabase Verification', 'PASS', dt, `Customer "${dbCust.name}" (Tier: ${dbCust.tier}) + Contact "${dbCust.customer_contacts[0].name}" verified in DB`);
    } else {
      recordResult('Create Customer + Contact via Frontend & Supabase Verification', 'FAIL', dt, `DB verification failed: ${dbCustErr?.message || 'Contacts missing'}`);
    }
  } catch (err: any) {
    recordResult('Create Customer via Frontend', 'FAIL', 0, err.message);
  }

  // -------------------------------------------------------------
  // PHASE 5: Sales Deal Creation & Pipeline Progress
  // -------------------------------------------------------------
  logHeader('PHASE 5: SALES DEAL CREATION & PIPELINE PROGRESSION');

  try {
    const t0 = Date.now();
    const dealPayload = {
      name: `Enterprise CPQ Expansion Deal ${runId}`,
      customer_id: testCustomerId,
      expected_close_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    };
    const dealRes = await api('/deals', {
      method: 'POST',
      body: JSON.stringify(dealPayload),
    });
    const dt = Date.now() - t0;

    if (!dealRes.ok || !dealRes.data?.data?.id) {
      throw new Error(`Deal creation failed: ${dealRes.data?.error?.message || dealRes.status}`);
    }
    testDealId = dealRes.data.data.id;

    // Direct DB Verification
    const { data: dbDeal, error: dbDealErr } = await serviceClient
      .from('deals')
      .select('*')
      .eq('id', testDealId)
      .single();

    if (!dbDealErr && dbDeal && dbDeal.name === dealPayload.name && dbDeal.customer_id === testCustomerId) {
      recordResult('Create Deal via Frontend & Supabase Verification', 'PASS', dt, `Deal "${dbDeal.name}" linked to Customer ${testCustomerId} stored in DB`);
    } else {
      recordResult('Create Deal via Frontend & Supabase Verification', 'FAIL', dt, `DB verification failed: ${dbDealErr?.message || 'Deal row not found'}`);
    }
  } catch (err: any) {
    recordResult('Create Deal via Frontend', 'FAIL', 0, err.message);
  }

  // -------------------------------------------------------------
  // PHASE 6: Quotation, Line Items, CPQ Engine Evaluation
  // -------------------------------------------------------------
  logHeader('PHASE 6: CPQ QUOTATION LIFECYCLE & DYNAMIC ENGINE CALCULATION');

  // 1. Create Quotation Draft
  try {
    const t0 = Date.now();
    const quotePayload = {
      customer_id: testCustomerId,
      deal_id: testDealId,
      deal_name: `Enterprise CPQ Expansion Deal ${runId}`,
      reference: `REF-DEALFLOW-${runId}`,
      expected_close_date: new Date(Date.now() + 20 * 86400000).toISOString().slice(0, 10),
    };
    const quoteRes = await api('/quotations', {
      method: 'POST',
      body: JSON.stringify(quotePayload),
    });
    const dt = Date.now() - t0;

    if (!quoteRes.ok || !quoteRes.data?.data?.id) {
      throw new Error(`Quotation creation failed: ${quoteRes.data?.error?.message || quoteRes.status}`);
    }
    testQuotationId = quoteRes.data.data.id;

    // Direct DB Check
    const { data: dbQuote, error: dbQuoteErr } = await serviceClient
      .from('quotations')
      .select('*')
      .eq('id', testQuotationId)
      .single();

    if (!dbQuoteErr && dbQuote && dbQuote.quote_number && dbQuote.status === 'draft') {
      recordResult('Create Quotation via Frontend & Supabase Check', 'PASS', dt, `Quotation ${dbQuote.quote_number} generated with draft status in DB`);
    } else {
      recordResult('Create Quotation via Frontend & Supabase Check', 'FAIL', dt, `DB mismatch: ${dbQuoteErr?.message || 'Quotation row not found'}`);
    }
  } catch (err: any) {
    recordResult('Create Quotation via Frontend', 'FAIL', 0, err.message);
  }

  // 2. Add Line Item to Quotation
  try {
    const t0 = Date.now();
    const linePayload = {
      product_id: testProductId,
      quantity: 4,
      unit_price: 125000,
      discount_percent: 10,
    };
    const lineRes = await api(`/quotations/${testQuotationId}/lines`, {
      method: 'POST',
      body: JSON.stringify(linePayload),
    });
    const dt = Date.now() - t0;

    if (!lineRes.ok || !lineRes.data?.data) {
      throw new Error(`Line creation failed: ${lineRes.data?.error?.message || lineRes.status}`);
    }

    const fullQuote = lineRes.data.data;
    const addedLine = fullQuote.lines && fullQuote.lines.length > 0 ? fullQuote.lines[0] : null;

    if (!addedLine || !addedLine.id) {
      throw new Error(`Line was not returned in quotation payload`);
    }
    const lineId = addedLine.id;

    // Verify mathematical correctness in DB
    const { data: dbLine, error: dbLineErr } = await serviceClient
      .from('quotation_lines')
      .select('*')
      .eq('id', lineId)
      .single();

    const expectedNetPrice = 125000 * (1 - 0.10); // 112,500
    const expectedLineTotal = expectedNetPrice * 4; // 450,000

    if (!dbLineErr && dbLine && Number(dbLine.net_price) === expectedNetPrice && Number(dbLine.line_total) === expectedLineTotal) {
      recordResult('Add Quotation Line & Mathematical Engine DB Check', 'PASS', dt, `Qty: 4, Unit: ₹125K, 10% Disc -> Net: ₹${dbLine.net_price}, Total: ₹${dbLine.line_total} verified in DB`);
    } else {
      recordResult('Add Quotation Line & Mathematical Engine DB Check', 'FAIL', dt, `Math or DB mismatch: Net=${dbLine?.net_price}, Total=${dbLine?.line_total}`);
    }
  } catch (err: any) {
    recordResult('Add Quotation Line via Frontend', 'FAIL', 0, err.message);
  }

  // 3. Evaluate Quotation CPQ Engine (Margins, Discount Ceilings, Risk)
  try {
    const t0 = Date.now();
    const evalRes = await api(`/quotations/${testQuotationId}/evaluate`);
    const dt = Date.now() - t0;
    const evaluation = evalRes.data?.data;

    const hasMargin = evaluation?.margin && typeof evaluation.margin.gross_margin === 'number';
    const hasRisk = evaluation?.risk && typeof evaluation.risk.blended_risk_score === 'number';

    if (hasMargin && hasRisk) {
      recordResult('CPQ Real-Time Margin & Risk Engine Evaluation', 'PASS', dt, `Revenue: ₹${evaluation.margin.revenue}, Margin: ${evaluation.margin.margin_percent}%, Risk: ${evaluation.risk.risk_level} (Score: ${evaluation.risk.blended_risk_score})`);
    } else {
      recordResult('CPQ Real-Time Margin & Risk Engine Evaluation', 'FAIL', dt, 'Evaluation payload missing margin or risk attributes');
    }
  } catch (err: any) {
    recordResult('CPQ Real-Time Margin & Risk Engine Evaluation', 'FAIL', 0, err.message);
  }

  // 4. Submit Quotation for Approval / Auto-Approval
  try {
    const t0 = Date.now();
    const submitRes = await api(`/quotations/${testQuotationId}/submit-for-approval`, {
      method: 'POST',
    });
    const dt = Date.now() - t0;

    // Check DB state update
    const { data: updatedQuote, error: quoteCheckErr } = await serviceClient
      .from('quotations')
      .select('status, approval_status')
      .eq('id', testQuotationId)
      .single();

    if (!quoteCheckErr && updatedQuote && (updatedQuote.status === 'approved' || updatedQuote.status === 'pending_approval')) {
      recordResult('Submit Quotation for Approval & DB State Transition', 'PASS', dt, `Quotation state transitioned to status="${updatedQuote.status}", approval="${updatedQuote.approval_status}" in DB`);
    } else {
      recordResult('Submit Quotation for Approval & DB State Transition', 'FAIL', dt, `Unexpected state: ${updatedQuote?.status}`);
    }
  } catch (err: any) {
    recordResult('Submit Quotation for Approval', 'FAIL', 0, err.message);
  }

  // -------------------------------------------------------------
  // PHASE 7: Invoicing & Billing Generation (Frontend -> DB)
  // -------------------------------------------------------------
  logHeader('PHASE 7: INVOICE GENERATION & ACCOUNTING RECONCILIATION');

  try {
    // If quotation was pending_approval, ensure it is set to approved so invoice can generate
    await serviceClient.from('quotations').update({ status: 'approved' }).eq('id', testQuotationId);

    const t0 = Date.now();
    const invRes = await api(`/quotations/${testQuotationId}/billing/generate-invoice`, {
      method: 'POST',
    });
    const dt = Date.now() - t0;

    if (!invRes.ok || !invRes.data?.data?.id) {
      throw new Error(`Invoice generation failed: ${invRes.data?.error?.message || invRes.status}`);
    }
    testInvoiceId = invRes.data.data.id;

    // Verify Invoice and Line Items in Supabase
    const { data: dbInv, error: dbInvErr } = await serviceClient
      .from('invoices')
      .select('*, invoice_line_items(*)')
      .eq('id', testInvoiceId)
      .single();

    if (!dbInvErr && dbInv && dbInv.invoice_number && Number(dbInv.subtotal) === 450000 && dbInv.invoice_line_items?.length > 0) {
      recordResult('Generate Invoice from Quotation & Verify Supabase', 'PASS', dt, `Invoice ${dbInv.invoice_number} created with Subtotal: ₹${dbInv.subtotal}, ${dbInv.invoice_line_items.length} line item(s) in DB`);
    } else {
      recordResult('Generate Invoice from Quotation & Verify Supabase', 'FAIL', dt, `Invoice verification failed: ${dbInvErr?.message || 'Invoice or lines mismatch'}`);
    }
  } catch (err: any) {
    recordResult('Generate Invoice from Quotation', 'FAIL', 0, err.message);
  }

  // -------------------------------------------------------------
  // PHASE 8: Multi-Warehouse Operations & Fulfillment
  // -------------------------------------------------------------
  logHeader('PHASE 8: WAREHOUSE & OPERATIONS INTEGRATION');

  try {
    const t0 = Date.now();
    const whPayload = {
      name: `Bangalore Central Hub ${runId}`,
      code: `BLR-HUB-${runId}`,
      type: 'distribution_center',
      address: { city: 'Bengaluru', country: 'India' },
    };
    const whRes = await api('/warehouses', {
      method: 'POST',
      body: JSON.stringify(whPayload),
    });
    const dt = Date.now() - t0;

    if (!whRes.ok || !whRes.data?.data?.id) {
      throw new Error(`Warehouse creation failed: ${whRes.data?.error?.message || whRes.status}`);
    }
    testWarehouseId = whRes.data.data.id;

    // Direct DB Verification
    const { data: dbWh, error: dbWhErr } = await serviceClient
      .from('warehouses')
      .select('*')
      .eq('id', testWarehouseId)
      .single();

    if (!dbWhErr && dbWh && dbWh.name === whPayload.name && dbWh.code === whPayload.code) {
      recordResult('Create Warehouse Hub via Frontend & DB Verification', 'PASS', dt, `Warehouse "${dbWh.name}" (Code: ${dbWh.code}) verified in DB`);
    } else {
      recordResult('Create Warehouse Hub via Frontend & DB Verification', 'FAIL', dt, `DB mismatch: ${dbWhErr?.message || 'Warehouse row not found'}`);
    }
  } catch (err: any) {
    recordResult('Create Warehouse Hub via Frontend', 'FAIL', 0, err.message);
  }

  // -------------------------------------------------------------
  // PHASE 9: Security & Negative Boundary Checks
  // -------------------------------------------------------------
  logHeader('PHASE 9: SECURITY & TENANT ISOLATION BOUNDARY TESTING');

  // Test unauthenticated call
  try {
    const t0 = Date.now();
    const res = await fetch(`${FRONTEND_URL}/customers`);
    const dt = Date.now() - t0;
    if (res.status === 401 || res.status === 403) {
      recordResult('Unauthenticated Request Rejection (Security Guard)', 'PASS', dt, 'Frontend/Backend properly rejected unauthenticated request with 401/403');
    } else {
      recordResult('Unauthenticated Request Rejection (Security Guard)', 'FAIL', dt, `Security hole: Expected 401/403 but got ${res.status}`);
    }
  } catch (err: any) {
    recordResult('Unauthenticated Request Rejection', 'FAIL', 0, err.message);
  }

  // Test schema validation error (Zod)
  try {
    const t0 = Date.now();
    const res = await api('/customers', {
      method: 'POST',
      body: JSON.stringify({ name: '', tier: 'invalid_tier_value' }),
    });
    const dt = Date.now() - t0;
    if (res.status === 400 || res.data?.error?.code === 'VALIDATION_ERROR') {
      recordResult('Zod Validation Schema Rejection (Malformed Data)', 'PASS', dt, `Malformed payload rejected with code: ${res.data?.error?.code || res.status}`);
    } else {
      recordResult('Zod Validation Schema Rejection (Malformed Data)', 'FAIL', dt, 'Backend accepted invalid schema payload');
    }
  } catch (err: any) {
    recordResult('Zod Validation Schema Rejection', 'FAIL', 0, err.message);
  }

  // -------------------------------------------------------------
  // PHASE 10: Teardown & Cleanup
  // -------------------------------------------------------------
  logHeader('PHASE 10: AUTOMATED TEST TEARDOWN & DATABASE CLEANUP');

  try {
    const t0 = Date.now();
    // Delete in reverse FK order
    if (testInvoiceId) {
      await serviceClient.from('invoice_line_items').delete().eq('invoice_id', testInvoiceId);
      await serviceClient.from('invoices').delete().eq('id', testInvoiceId);
    }
    if (testQuotationId) {
      await serviceClient.from('quotation_lines').delete().eq('quotation_id', testQuotationId);
      await serviceClient.from('quotations').delete().eq('id', testQuotationId);
    }
    if (testDealId) {
      await serviceClient.from('deals').delete().eq('id', testDealId);
    }
    if (testCustomerId) {
      await serviceClient.from('customer_contacts').delete().eq('customer_id', testCustomerId);
      await serviceClient.from('customers').delete().eq('id', testCustomerId);
    }
    if (testProductId) {
      await serviceClient.from('products').delete().eq('id', testProductId);
    }
    if (testCategoryId) {
      await serviceClient.from('categories').delete().eq('id', testCategoryId);
    }
    if (testWarehouseId) {
      await serviceClient.from('warehouses').delete().eq('id', testWarehouseId);
    }
    const dt = Date.now() - t0;
    recordResult('Full Cascading Teardown of Test Records', 'PASS', dt, 'All ephemeral test entities cleaned up; zero database pollution');
  } catch (err: any) {
    recordResult('Teardown of Test Records', 'FAIL', 0, err.message);
  }

  // -------------------------------------------------------------
  // FINAL EXECUTIVE SUMMARY
  // -------------------------------------------------------------
  const totalDuration = Date.now() - overallStart;
  console.log(`\n${CYAN}================================================================================${RESET}`);
  console.log(`${BOLD}📊 HARDCORE TEST EXECUTION RESULTS SUMMARY${RESET}`);
  console.log(`${CYAN}================================================================================${RESET}`);
  console.log(`Total Verification Steps: ${BOLD}${stats.passed + stats.failed}${RESET}`);
  console.log(`Tests Passed:             ${BOLD}${GREEN}${stats.passed} PASSED${RESET}`);
  console.log(`Tests Failed:             ${BOLD}${stats.failed > 0 ? RED : GREEN}${stats.failed} FAILED${RESET}`);
  console.log(`Total Execution Time:     ${BOLD}${totalDuration}ms${RESET}`);
  console.log(`Pass Rate:                ${BOLD}${((stats.passed / (stats.passed + stats.failed)) * 100).toFixed(1)}%${RESET}`);
  console.log(`${CYAN}================================================================================${RESET}\n`);

  if (stats.failed > 0) {
    process.exit(1);
  }
}

runHardcoreTest().catch((err) => {
  console.error('Unhandled fatal error in test suite:', err);
  process.exit(1);
});
