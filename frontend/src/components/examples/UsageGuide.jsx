import React from 'react';
import ConnectionTest from './ConnectionTest';

export function UsageGuide() {
  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Task Manager - WebSocket Test 🎉</h1>
        <p className="text-gray-600">Test your WebSocket connection and functionality</p>
      </div>

      <ConnectionTest />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-blue-800">What's Installed</h2>
        <ul className="space-y-2 text-blue-700">
          <li>✅ @radix-ui/themes - Complete theme system</li>
          <li>✅ @radix-ui/react-dialog - Modal dialogs</li>
          <li>✅ @radix-ui/react-dropdown-menu - Dropdown menus</li>
          <li>✅ @radix-ui/react-toast - Toast notifications</li>
          <li>✅ @radix-ui/react-tooltip - Tooltips</li>
          <li>✅ @radix-ui/react-popover - Popovers</li>
          <li>✅ @radix-ui/react-select - Select dropdowns</li>
          <li>✅ @radix-ui/react-separator - Visual separators</li>
          <li>✅ @radix-ui/react-tabs - Tabbed interfaces</li>
          <li>✅ @radix-ui/react-avatar - User avatars</li>
          <li>✅ @radix-ui/react-checkbox - Checkboxes</li>
          <li>✅ @radix-ui/react-label - Form labels</li>
          <li>✅ @radix-ui/react-slot - Composition utility</li>
        </ul>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-green-800">How to Use</h2>
        <div className="space-y-4 text-green-700">
          <div>
            <h3 className="font-semibold">1. Import Components</h3>
            <pre className="bg-green-100 p-3 rounded mt-2 text-sm overflow-x-auto">
{`import { Button, Dialog, Select } from './components/ui';
import { Label } from '@radix-ui/react-label';`}
            </pre>
          </div>
          
          <div>
            <h3 className="font-semibold">2. Use in Your Components</h3>
            <pre className="bg-green-100 p-3 rounded mt-2 text-sm overflow-x-auto">
{`function MyComponent() {
  return (
    <div>
      <Button>Click me!</Button>
      <Label htmlFor="input">Name</Label>
      <input id="input" />
    </div>
  );
}`}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold">3. Check the Demo</h3>
            <p>Import and use the <code className="bg-green-100 px-2 py-1 rounded">RadixUIDemo</code> component to see all components in action!</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border border-yellow-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-yellow-800">Key Features</h2>
        <ul className="space-y-2 text-yellow-700">
          <li>🎨 <strong>Accessible:</strong> Built with accessibility in mind</li>
          <li>🎭 <strong>Customizable:</strong> Easy to style with Tailwind CSS</li>
          <li>🔧 <strong>Composable:</strong> Mix and match components</li>
          <li>📱 <strong>Responsive:</strong> Works on all screen sizes</li>
          <li>⚡ <strong>Performant:</strong> Optimized for React</li>
          <li>🎯 <strong>TypeScript Ready:</strong> Full type support</li>
        </ul>
      </div>

      <div className="bg-gray-50 border border-purple-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-purple-800">Next Steps</h2>
        <ol className="space-y-2 text-purple-700">
          <li>1. Explore the demo components in <code className="bg-gray-100 px-2 py-1 rounded">/components/examples/</code></li>
          <li>2. Start building your own components using the UI primitives</li>
          <li>3. Customize the theme colors and styling to match your design</li>
          <li>4. Check the <a href="https://www.radix-ui.com/docs" className="underline hover:no-underline" target="_blank" rel="noopener noreferrer">Radix UI documentation</a> for more components</li>
        </ol>
      </div>
    </div>
  );
}
