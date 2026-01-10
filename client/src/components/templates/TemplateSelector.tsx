import { useState, useEffect } from 'react';
import { FileText, Star, ChevronRight, Loader2, Zap } from 'lucide-react';
import { templatesApi, type RequestTemplate } from '../../api/templates';
import { getPriorityBadgeColor, getPriorityLabel } from '../../constants/status';
import { cn } from '../../utils/cn';

interface TemplateSelectorProps {
  onSelect: (template: RequestTemplate) => void;
  selectedCategoryId?: string;
  className?: string;
}

export function TemplateSelector({
  onSelect,
  selectedCategoryId,
  className,
}: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<RequestTemplate[]>([]);
  const [popularTemplates, setPopularTemplates] = useState<RequestTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'popular' | 'all' | 'category'>('popular');

  useEffect(() => {
    loadTemplates();
  }, [selectedCategoryId]);

  async function loadTemplates() {
    setIsLoading(true);
    try {
      const [allRes, popularRes] = await Promise.all([
        templatesApi.getAll(),
        templatesApi.getPopular(5),
      ]);

      if (allRes.success && allRes.data) {
        setTemplates(allRes.data);
      }
      if (popularRes.success && popularRes.data) {
        setPopularTemplates(popularRes.data);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSelect(template: RequestTemplate) {
    try {
      // Increment usage count
      await templatesApi.use(template.id);
      onSelect(template);
    } catch (error) {
      console.error('Failed to use template:', error);
      // Still select even if usage count fails
      onSelect(template);
    }
  }

  const filteredTemplates =
    selectedCategoryId && activeTab === 'category'
      ? templates.filter((t) => t.categoryId === selectedCategoryId)
      : activeTab === 'popular'
        ? popularTemplates
        : templates;

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-8', className)}>
        <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
      </div>
    );
  }

  if (templates.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-2 text-sm">
        <Zap className="w-4 h-4 text-yellow-500" />
        <span className="font-medium text-gray-700 dark:text-gray-300">เลือกจาก Template</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('popular')}
          className={cn(
            'px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
            activeTab === 'popular'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
          )}
        >
          <Star className="w-4 h-4 inline mr-1" />
          ยอดนิยม
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={cn(
            'px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
            activeTab === 'all'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
          )}
        >
          <FileText className="w-4 h-4 inline mr-1" />
          ทั้งหมด
        </button>
        {selectedCategoryId && (
          <button
            onClick={() => setActiveTab('category')}
            className={cn(
              'px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              activeTab === 'category'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            )}
          >
            หมวดหมู่นี้
          </button>
        )}
      </div>

      {/* Template List */}
      <div className="grid gap-2 max-h-64 overflow-y-auto">
        {filteredTemplates.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            ไม่พบ Template
          </p>
        ) : (
          filteredTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleSelect(template)}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left group"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                style={{ backgroundColor: template.category.color || '#e5e7eb' }}
              >
                {template.category.icon || '📋'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-white truncate">
                    {template.name}
                  </span>
                  <span
                    className={cn(
                      'px-1.5 py-0.5 text-xs rounded-full',
                      getPriorityBadgeColor(template.priority)
                    )}
                  >
                    {getPriorityLabel(template.priority)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {template.title}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {template.category.nameTh} • ใช้แล้ว {template.usageCount} ครั้ง
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export default TemplateSelector;
