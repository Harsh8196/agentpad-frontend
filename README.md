# AgentPad Frontend

Visual flow builder for creating AI agent workflows on the SEI blockchain.

## 🏗️ Architecture

This is the **frontend flow builder** for AgentPad, designed to work with the standalone backend executor. The architecture follows a **decoupled approach**:

- **Frontend**: Pure flow builder (Next.js + React Flow)
- **Backend**: Standalone executor (Node.js + Docker)
- **Database**: Supabase (PostgreSQL + Auth)

## 🚀 Features

- **Visual Flow Builder** - Drag-and-drop interface for creating flows
- **Block Library** - Pre-built blocks for common operations
- **Node Configuration** - Dynamic forms for each block type
- **Real-time Preview** - See configuration changes instantly
- **Flow Export/Import** - Save and load flows as JSON
- **Authentication** - Supabase-powered user management
- **Responsive Design** - Works on desktop and mobile

## 📁 Structure

```
AgentPad-Frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── dashboard/          # Dashboard page
│   │   ├── flow-builder/       # Flow builder page
│   │   └── layout.tsx          # Root layout
│   ├── components/
│   │   ├── layout/             # Layout components
│   │   └── flow-builder/       # Flow builder components
│   │       ├── FlowBuilder.tsx # Main builder
│   │       ├── BlockLibrary.tsx # Block library
│   │       ├── FlowToolbar.tsx # Toolbar
│   │       ├── NodePanel.tsx   # Configuration panel
│   │       └── nodes/          # Node components
│   ├── lib/                    # Utilities
│   │   ├── supabase.ts         # Supabase client
│   │   └── auth.ts             # Auth utilities
│   └── hooks/                  # Custom hooks
├── public/                     # Static assets
└── package.json                # Dependencies
```

## 🛠️ Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

```bash
# Clone the repository
git clone <frontend-repo-url>
cd AgentPad-Frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase configuration
```

### Environment Variables

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Backend Configuration (optional)
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

## 🚀 Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Run type checking
npm run type-check
```

## 🎨 Available Blocks

### Basic Logic
- **Conditional** - If-then-else logic with comparison operators
- **Arithmetic** - Mathematical operations (add, subtract, multiply, divide)
- **Variable** - Set, get, and manipulate variables
- **Loop** - For, while, and forEach loops
- **Timer** - Delay, interval, and timeout operations

### Blockchain
- **Blockchain** - SEI blockchain operations (balance, transfer, swap)

## 🔧 Usage

### Creating a Flow

1. **Open Flow Builder** - Navigate to `/flow-builder`
2. **Add Blocks** - Drag blocks from the library to the canvas
3. **Connect Blocks** - Draw connections between block handles
4. **Configure Blocks** - Click blocks to configure their settings
5. **Save Flow** - Save your flow to the database or export as JSON

### Block Configuration

Each block type has its own configuration panel:

- **Conditional**: Set comparison operator and values
- **Arithmetic**: Choose operation and input values
- **Variable**: Define variable name and operation
- **Blockchain**: Configure blockchain operations and addresses

## 📦 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Or connect to GitHub for automatic deployments
```

### Other Platforms

The frontend can be deployed to:
- **Netlify** - Static site hosting
- **AWS Amplify** - Full-stack hosting
- **Google Cloud Run** - Containerized deployment
- **Docker** - Container deployment

## 🔗 Backend Integration

The frontend is designed to work with the **AgentPad Backend**:

1. **Build Flows** - Use the visual builder to create flows
2. **Export JSON** - Download flow configuration as JSON
3. **Send to Backend** - Execute flows via the backend API
4. **View Results** - Monitor execution results and logs

### Backend Communication

```javascript
// Example: Execute a flow
const response = await fetch('http://localhost:3001/api/execute', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    flow: flowData,
    environment: {
      variables: {}
    }
  })
});
```

## 🔒 Security

- **Client-side Only** - No sensitive operations in frontend
- **Environment Variables** - Secure configuration management
- **Supabase Auth** - Secure user authentication
- **CORS Protection** - Configured for backend communication

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🔗 Related Repositories

- **[AgentPad Backend](https://github.com/your-org/agentpad-backend)** - Standalone execution engine
- **[sei-agent-kit](https://github.com/sei-protocol/sei-agent-kit)** - SEI blockchain integration
