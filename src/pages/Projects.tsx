import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'
import {
  Folder,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Tag,
  Layers,
} from 'lucide-react'
import { ProjectModal } from '../components/ProjectModal'
import { CategoryModal } from '../components/CategoryModal'
import { TagModal } from '../components/TagModal'

type Tab = 'projects' | 'categories' | 'tags'

export function Projects() {
  const [activeTab, setActiveTab] = useState<Tab>('projects')
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [isTagModalOpen, setIsTagModalOpen] = useState(false)
  const [editingProjectId, setEditingProjectId] = useState<Id<'projects'> | undefined>()
  const [editingCategoryId, setEditingCategoryId] = useState<Id<'categories'> | undefined>()
  const [editingTagId, setEditingTagId] = useState<Id<'tags'> | undefined>()

  const projects = useQuery(api.projects.listWithStats)
  const categories = useQuery(api.categories.listWithStats)
  const tags = useQuery(api.tags.listWithStats)

  const deleteProject = useMutation(api.projects.remove)
  const deleteCategory = useMutation(api.categories.remove)
  const deleteTag = useMutation(api.tags.remove)

  const handleEditProject = (id: Id<'projects'>) => {
    setEditingProjectId(id)
    setIsProjectModalOpen(true)
  }

  const handleEditCategory = (id: Id<'categories'>) => {
    setEditingCategoryId(id)
    setIsCategoryModalOpen(true)
  }

  const handleEditTag = (id: Id<'tags'>) => {
    setEditingTagId(id)
    setIsTagModalOpen(true)
  }

  const handleCloseProjectModal = () => {
    setIsProjectModalOpen(false)
    setEditingProjectId(undefined)
  }

  const handleCloseCategoryModal = () => {
    setIsCategoryModalOpen(false)
    setEditingCategoryId(undefined)
  }

  const handleCloseTagModal = () => {
    setIsTagModalOpen(false)
    setEditingTagId(undefined)
  }

  const tabs = [
    { id: 'projects' as Tab, label: 'Projects', icon: Folder },
    { id: 'categories' as Tab, label: 'Categories', icon: Layers },
    { id: 'tags' as Tab, label: 'Tags', icon: Tag },
  ]

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-medium text-surface-900 mb-2">
          Organization
        </h1>
        <p className="text-surface-500 font-sans">
          Manage your projects, categories, and tags
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-sans text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-primary-100 text-primary-700'
                : 'text-surface-600 hover:bg-surface-100'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Projects Tab */}
      {activeTab === 'projects' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-serif font-medium text-surface-900">
              Projects ({projects?.length || 0})
            </h2>
            <button
              onClick={() => setIsProjectModalOpen(true)}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          </div>

          {projects === undefined ? (
            <div className="flex items-center justify-center py-12">
              <div className="spinner" />
            </div>
          ) : projects.length === 0 ? (
            <div className="empty-state">
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                <Folder className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-serif font-medium text-surface-900 mb-2">
                No projects yet
              </h3>
              <p className="text-surface-500 font-sans text-sm">
                Create a project to organize your tasks
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {projects.map((project) => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  onEdit={() => handleEditProject(project._id)}
                  onDelete={() => deleteProject({ id: project._id })}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-serif font-medium text-surface-900">
              Categories ({categories?.length || 0})
            </h2>
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4" />
              New Category
            </button>
          </div>

          {categories === undefined ? (
            <div className="flex items-center justify-center py-12">
              <div className="spinner" />
            </div>
          ) : categories.length === 0 ? (
            <div className="empty-state">
              <div className="w-16 h-16 rounded-full bg-accent-100 flex items-center justify-center mb-4">
                <Layers className="w-8 h-8 text-accent-600" />
              </div>
              <h3 className="text-lg font-serif font-medium text-surface-900 mb-2">
                No categories yet
              </h3>
              <p className="text-surface-500 font-sans text-sm">
                Create categories to classify your tasks
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {categories.map((category) => (
                <CategoryCard
                  key={category._id}
                  category={category}
                  onEdit={() => handleEditCategory(category._id)}
                  onDelete={() => deleteCategory({ id: category._id })}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tags Tab */}
      {activeTab === 'tags' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-serif font-medium text-surface-900">
              Tags ({tags?.length || 0})
            </h2>
            <button
              onClick={() => setIsTagModalOpen(true)}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4" />
              New Tag
            </button>
          </div>

          {tags === undefined ? (
            <div className="flex items-center justify-center py-12">
              <div className="spinner" />
            </div>
          ) : tags.length === 0 ? (
            <div className="empty-state">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                <Tag className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-serif font-medium text-surface-900 mb-2">
                No tags yet
              </h3>
              <p className="text-surface-500 font-sans text-sm">
                Create tags to label your tasks
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {tags.map((tag) => (
                <TagCard
                  key={tag._id}
                  tag={tag}
                  onEdit={() => handleEditTag(tag._id)}
                  onDelete={() => deleteTag({ id: tag._id })}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={handleCloseProjectModal}
        projectId={editingProjectId}
      />
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={handleCloseCategoryModal}
        categoryId={editingCategoryId}
      />
      <TagModal
        isOpen={isTagModalOpen}
        onClose={handleCloseTagModal}
        tagId={editingTagId}
      />
    </div>
  )
}

// Project Card Component
interface ProjectCardProps {
  project: {
    _id: Id<'projects'>
    name: string
    description?: string
    color?: string
    taskCount: number
    completedCount: number
    pendingCount: number
  }
  onEdit: () => void
  onDelete: () => void
}

function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  const progress = project.taskCount > 0
    ? Math.round((project.completedCount / project.taskCount) * 100)
    : 0

  return (
    <div className="card card-hover flex items-center gap-4">
      <div
        className="w-3 h-12 rounded-full flex-shrink-0"
        style={{ backgroundColor: project.color || '#8f7559' }}
      />
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-surface-900">{project.name}</h3>
        {project.description && (
          <p className="text-sm text-surface-500 line-clamp-1">
            {project.description}
          </p>
        )}
        <div className="flex items-center gap-4 mt-2">
          <span className="text-xs text-surface-500 font-sans">
            {project.pendingCount} pending · {project.completedCount} completed
          </span>
          {project.taskCount > 0 && (
            <div className="flex-1 max-w-[100px] h-1.5 bg-surface-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </div>
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="btn btn-ghost p-2"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-soft-lg border border-surface-200 py-1 z-20 min-w-[120px]">
              <button
                onClick={() => {
                  onEdit()
                  setShowMenu(false)
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-surface-700 hover:bg-surface-50 font-sans"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => {
                  onDelete()
                  setShowMenu(false)
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 font-sans"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// Category Card Component
interface CategoryCardProps {
  category: {
    _id: Id<'categories'>
    name: string
    color?: string
    taskCount: number
    completedCount: number
    pendingCount: number
  }
  onEdit: () => void
  onDelete: () => void
}

function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="card card-hover flex items-center gap-4">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${category.color}20` || '#0ea5e920' }}
      >
        <Layers className="w-5 h-5" style={{ color: category.color || '#0ea5e9' }} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-surface-900">{category.name}</h3>
        <span className="text-xs text-surface-500 font-sans">
          {category.taskCount} tasks
        </span>
      </div>
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="btn btn-ghost p-2"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-soft-lg border border-surface-200 py-1 z-20 min-w-[120px]">
              <button
                onClick={() => {
                  onEdit()
                  setShowMenu(false)
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-surface-700 hover:bg-surface-50 font-sans"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => {
                  onDelete()
                  setShowMenu(false)
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 font-sans"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// Tag Card Component
interface TagCardProps {
  tag: {
    _id: Id<'tags'>
    name: string
    color?: string
    taskCount: number
  }
  onEdit: () => void
  onDelete: () => void
}

function TagCard({ tag, onEdit, onDelete }: TagCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div
      className="relative inline-flex items-center gap-2 px-4 py-2 rounded-full border group"
      style={{
        backgroundColor: `${tag.color}15` || '#6366f115',
        borderColor: `${tag.color}40` || '#6366f140',
      }}
    >
      <span
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: tag.color || '#6366f1' }}
      />
      <span className="font-sans text-sm font-medium" style={{ color: tag.color || '#6366f1' }}>
        {tag.name}
      </span>
      <span className="text-xs opacity-60" style={{ color: tag.color || '#6366f1' }}>
        ({tag.taskCount})
      </span>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <MoreHorizontal className="w-4 h-4" style={{ color: tag.color || '#6366f1' }} />
      </button>
      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-soft-lg border border-surface-200 py-1 z-20 min-w-[120px]">
            <button
              onClick={() => {
                onEdit()
                setShowMenu(false)
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-surface-700 hover:bg-surface-50 font-sans"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={() => {
                onDelete()
                setShowMenu(false)
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 font-sans"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  )
}

