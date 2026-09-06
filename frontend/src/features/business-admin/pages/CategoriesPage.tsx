import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { KpiCard } from '@/components/ui/kpi-card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/shared'
import { PageHeader } from '../components/BusinessAdminPageHeader'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  useCategoryTree,
  useCategoryKpis,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '../hooks/use-business-admin'
import type { CategoryTreeNode, Category } from '../types'
import { toast } from 'sonner'
import {
  Plus,
  ChevronRight,
  ChevronDown,
  FolderTree,
  Tag,
  Package,
  Pencil,
  Trash2,
  FolderOpen,
} from 'lucide-react'

export function CategoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryTreeNode | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [showDialog, setShowDialog] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [parentForNew, setParentForNew] = useState<string>('')
  const [form, setForm] = useState({ name: '', description: '', parentId: '_none', status: 'active', sortOrder: '0' })
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: tree, isLoading: treeLoading, error: treeError, refetch: refetchTree } = useCategoryTree()
  const { data: kpis, isLoading: kpisLoading } = useCategoryKpis()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()

  const findNodeById = (nodes: CategoryTreeNode[] | undefined, id: string): CategoryTreeNode | null => {
    if (!nodes) return null
    for (const node of nodes) {
      if (node.id === id) return node
      const found = findNodeById(node.children, id)
      if (found) return found
    }
    return null
  }

  // Keep selectedCategory fresh after refetch (update/create/delete re-fetch the tree)
  useEffect(() => {
    if (!selectedCategory || !tree) return
    const fresh = findNodeById(tree, selectedCategory.id)
    if (fresh && fresh !== selectedCategory) setSelectedCategory(fresh)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tree])

  const collectAllIds = (nodes: CategoryTreeNode[]): string[] =>
    nodes.flatMap((n) => [n.id, ...collectAllIds(n.children || [])])

  const allExpanded = useMemo(
    () => (tree ? collectAllIds(tree).every((id) => expandedIds.has(id)) : false),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tree, expandedIds],
  )

  const handleToggleAll = () => {
    if (!tree) return
    if (allExpanded) setExpandedIds(new Set())
    else setExpandedIds(new Set(collectAllIds(tree)))
  }

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleOpenCreate = (parentId?: string) => {
    setEditingCategory(null)
    setParentForNew(parentId || '')
    setForm({ name: '', description: '', parentId: parentId || '_none', status: 'active', sortOrder: '0' })
    setShowDialog(true)
  }

  const handleOpenEdit = () => {
    if (!selectedCategory) return
    setEditingCategory(selectedCategory)
    setParentForNew(selectedCategory.parentId || '')
    setForm({ name: selectedCategory.name, description: selectedCategory.description || '', parentId: selectedCategory.parentId || '_none', status: selectedCategory.status || 'active', sortOrder: String(selectedCategory.sortOrder ?? 0) })
    setShowDialog(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Category name is required')
      return
    }
    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({ id: editingCategory.id, data: { name: form.name, description: form.description } })
        toast.success('Category updated')
      } else {
        await createCategory.mutateAsync({ name: form.name, description: form.description, parentId: parentForNew || undefined })
        toast.success('Category created')
      }
      setShowDialog(false)
      setForm({ name: '', description: '', parentId: '_none', status: 'active', sortOrder: '0' })
      setEditingCategory(null)
      setParentForNew('')
    } catch {
      toast.error(editingCategory ? 'Failed to update category' : 'Failed to create category')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteCategory.mutateAsync(deleteId)
      toast.success('Category deleted')
      setDeleteId(null)
      if (selectedCategory?.id === deleteId) setSelectedCategory(null)
    } catch {
      toast.error('Failed to delete category')
    }
  }

  const collectCategoryOptions = (nodes: CategoryTreeNode[], excludeId?: string): { id: string; name: string; depth: number }[] => {
    const result: { id: string; name: string; depth: number }[] = []
    for (const node of nodes) {
      if (node.id !== excludeId) {
        result.push({ id: node.id, name: node.name, depth: 0 })
        if (node.children?.length) {
          for (const child of collectCategoryOptions(node.children, excludeId)) {
            result.push({ ...child, depth: child.depth + 1 })
          }
        }
      }
    }
    return result
  }

  const allCategories = tree ? collectCategoryOptions(tree) : []

  const renderTreeNode = (node: CategoryTreeNode, depth: number = 0) => {
    const hasChildren = node.children && node.children.length > 0
    const isExpanded = expandedIds.has(node.id)
    const isSelected = selectedCategory?.id === node.id

    return (
      <div key={node.id}>
        <div
          className={`flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
            isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-accent/50 text-foreground'
          }`}
          style={{ paddingLeft: `${12 + depth * 20}px` }}
          onClick={() => setSelectedCategory(node)}
        >
          {hasChildren ? (
            <button
              onClick={(e) => { e.stopPropagation(); toggleExpand(node.id) }}
              className="shrink-0 p-0.5 rounded hover:bg-accent transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          ) : (
            <span className="w-5 shrink-0" />
          )}
          <FolderOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="text-[13px] font-medium truncate flex-1">{node.name}</span>
          <Badge variant="secondary" className="text-[11px] tabular-nums shrink-0">
            {node.productCount}
          </Badge>
          <Badge variant={node.status === 'active' ? 'success' : 'secondary'} className="text-[11px] shrink-0">
            {node.status}
          </Badge>
        </div>
        {hasChildren && isExpanded && (
          <div>
            {node.children.map((child) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  const canDelete = selectedCategory && selectedCategory.subcategoryCount === 0 && selectedCategory.productCount === 0

  return (
    <div className="space-y-4">
      <PageHeader
        title="Categories"
        description="Organize your products with categories and subcategories."
        breadcrumbs={[
          { label: 'Business Admin', path: '/business-admin/dashboard' },
          { label: 'Catalog' },
          { label: 'Categories' },
        ]}
        actions={
          <Button onClick={() => handleOpenCreate()}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add Category
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {kpisLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
        ) : (
          <>
            <KpiCard label="Total Categories" value={kpis?.totalCategories ?? 0} icon={<FolderTree className="h-5 w-5" />} />
            <KpiCard label="Subcategories" value={kpis?.totalSubcategories ?? 0} variant="info" icon={<Tag className="h-5 w-5" />} />
            <KpiCard label="Total Products" value={kpis?.totalProducts ?? 0} variant="success" icon={<Package className="h-5 w-5" />} />
          </>
        )}
      </div>

      {/* Two-panel layout */}
      <div className="flex gap-6 min-h-[500px]">
        {/* Left panel - Tree */}
        <div className="w-[60%]">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-[15px]">Category Tree</CardTitle>
            </CardHeader>
            <CardContent>
              {treeLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)}
                </div>
              ) : treeError ? (
                <ErrorState title="Failed to load categories" onRetry={refetchTree} />
              ) : !tree || tree.length === 0 ? (
                <EmptyState
                  icon={<FolderTree className="h-8 w-8" />}
                  title="No categories yet"
                  description="Create your first category to organize products."
                  action={
                    <Button onClick={() => handleOpenCreate()}>
                      <Plus className="h-4 w-4 mr-1.5" />
                      Add Category
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-0.5">
                  {tree.map((node) => renderTreeNode(node))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right panel - Detail */}
        <div className="w-[40%]">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-[15px]">Category Details</CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedCategory ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <FolderOpen className="h-10 w-10 text-muted-foreground/40 mb-3" />
                  <p className="text-[13px] text-muted-foreground">Select a category to view details</p>
                </div>
              ) : (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-h3 font-bold text-foreground">{selectedCategory.name}</h3>
                    {selectedCategory.description && (
                      <p className="mt-1 text-[13px] text-muted-foreground">{selectedCategory.description}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Products</p>
                      <p className="text-[15px] font-semibold text-foreground tabular-nums">{selectedCategory.productCount}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Subcategories</p>
                      <p className="text-[15px] font-semibold text-foreground tabular-nums">{selectedCategory.subcategoryCount}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Status</p>
                    <Badge variant={selectedCategory.status === 'active' ? 'success' : 'secondary'}>
                      {selectedCategory.status}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                    <Button variant="outline" size="sm" onClick={handleOpenEdit}>
                      <Pencil className="h-3.5 w-3.5 mr-1.5" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleOpenCreate(selectedCategory.id)}>
                      <Plus className="h-3.5 w-3.5 mr-1.5" />
                      Add Subcategory
                    </Button>
                    {canDelete && (
                      <Button variant="outline" size="sm" className="text-danger hover:text-danger" onClick={() => setDeleteId(selectedCategory.id)}>
                        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Create Category'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Electronics"
                className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                className="flex min-h-[80px] w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Optional description"
              />
            </div>
            {!editingCategory && (
              <div className="space-y-1.5">
                <Label>Parent Category</Label>
                <Select value={parentForNew} onValueChange={setParentForNew}>
                  <SelectTrigger>
                    <SelectValue placeholder="None (Top-level)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None (Top-level)</SelectItem>
                    {allCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {'  '.repeat(cat.depth)}{cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={createCategory.isPending || updateCategory.isPending}>
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete category?"
        description="This will permanently remove the category. Products in this category will become uncategorized."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        loading={deleteCategory.isPending}
      />
    </div>
  )
}
