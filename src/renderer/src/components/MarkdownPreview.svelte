<!-- src/renderer/src/components/MarkdownPreview.svelte -->
<script lang="ts">
  import { marked } from 'marked'
  import type { Project } from '$lib/types'

  interface Props {
    project: Project | null
  }

  let { project }: Props = $props()

  let markdownContent = $derived(project ? generateProjectMarkdown(project) : '')
  let htmlContent = $derived(markdownContent ? marked.parse(markdownContent) : '')

  function generateProjectMarkdown(p: Project): string {
    let md = `# ${p.meta.name}\n\n`
    md += `> 创建时间: ${new Date(p.meta.create_time).toLocaleString('zh-CN')}\n\n`
    
    if (p.context && p.context.trim()) {
      md += `## 项目背景\n\n${p.context}\n\n`
    }
    
    if (p.structure_tree.length > 0) {
      md += `## 系统结构\n\n`
      p.structure_tree.forEach(subsystem => {
        md += `### ${subsystem.name}\n`
        subsystem.children.forEach(device => {
          md += `- **${device.name}** (数量: ${device.quantity})\n`
          const specs = Object.entries(device.specs)
            .filter(([_, v]) => v && v.toString().trim())
            .map(([k, v]) => `${k}: ${v}`)
          if (specs.length > 0) {
            md += `  - ${specs.join(', ')}\n`
          }
        })
        md += '\n'
      })
    }
    
    return md
  }
</script>

<div class="markdown-preview">
  {#if project}
    <div class="markdown-content">
      {@html htmlContent}
    </div>
  {:else}
    <div class="empty-state">
      <p>暂无项目数据</p>
    </div>
  {/if}
</div>

<style>
  .markdown-preview {
    height: 100%;
    overflow-y: auto;
    padding: 1.5rem;
    background: var(--color-background, #fff);
  }

  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--ev-c-text-3, #999);
  }

  .markdown-content {
    max-width: 800px;
    margin: 0 auto;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .markdown-content :global(h1) {
    font-size: 1.75rem;
    font-weight: 600;
    margin: 0 0 1rem;
    color: var(--color-text, #1a1a1a);
    border-bottom: 1px solid var(--ev-c-gray-3, #e8e8e8);
    padding-bottom: 0.75rem;
  }

  .markdown-content :global(h2) {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 1.5rem 0 0.75rem;
    color: var(--color-text, #1a1a1a);
  }

  .markdown-content :global(h3) {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 1.25rem 0 0.5rem;
    color: var(--color-text, #333);
  }

  .markdown-content :global(p) {
    margin: 0.5rem 0;
    line-height: 1.6;
    color: var(--color-text, #333);
  }

  .markdown-content :global(blockquote) {
    margin: 0.5rem 0;
    padding: 0.5rem 1rem;
    background: var(--color-background-mute, #f5f5f5);
    border-left: 3px solid var(--ev-c-primary, #4a90d9);
    color: var(--ev-c-text-2, #666);
    font-size: 0.9375rem;
  }

  .markdown-content :global(ul) {
    margin: 0.5rem 0;
    padding-left: 1.5rem;
  }

  .markdown-content :global(li) {
    margin: 0.25rem 0;
    line-height: 1.5;
  }

  .markdown-content :global(strong) {
    color: var(--ev-c-primary, #4a90d9);
  }
</style>
