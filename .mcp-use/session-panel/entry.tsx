import React from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import Component from '/Users/e.t./Projects/mcp-use/mcp-servers/templates/redis-sessions/resources/session-panel/widget.tsx'

const container = document.getElementById('widget-root')
if (container && Component) {
  const root = createRoot(container)
  root.render(<Component />)
}
