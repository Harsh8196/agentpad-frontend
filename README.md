# AgentPad Frontend

A modern, visual flow builder for creating AI agent workflows on the SEI blockchain, featuring drag-and-drop automation and AI-powered workflow generation.

## 🏗️ Architecture

AgentPad Frontend is a **Next.js-based visual flow builder** that works seamlessly with the AgentPad backend executor. The architecture follows a **modern decoupled approach**:

- **Frontend**: Visual flow builder (Next.js 15 + React Flow + TypeScript)
- **Backend**: Standalone CLI executor (Node.js + sei-agent-kit)
- **Database**: Supabase (PostgreSQL + Auth + Real-time)
- **AI Integration**: OpenAI-powered workflow generation

## 🚀 Features

### Core Flow Builder
- **Visual Flow Builder** - Intuitive drag-and-drop interface for creating complex workflows
- **Block Library** - Comprehensive library of pre-built nodes for all operations
- **Real-time Configuration** - Dynamic forms that update instantly as you configure nodes
- **Variable Management** - Advanced variable declaration, selection, and manipulation
- **Flow Export/Import** - Save flows locally or to Supabase database
- **Template Library** - Share and reuse workflow templates

### AI-Powered Features
- **AI Workflow Planner** - Generate complete workflows from natural language descriptions
- **Smart Suggestions** - AI-powered workflow recommendations and optimizations
- **Intelligent Node Configuration** - Automatic parameter suggestions and validation

### Blockchain Integration
- **SEI Blockchain Support** - Full integration with SEI mainnet and testnet
- **Comprehensive DeFi Tools** - Symphony, Takara, Citrex, Carbon, and Twitter integrations
- **Smart Contract Support** - Dynamic ABI parsing and execution
- **Market Data** - Real-time token price fetching via CoinGecko

## 📁 Project Structure

```
agentpad-frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── auth/              # Authentication pages
│   │   │   ├── login/         # Login page
│   │   │   └── register/      # Registration page
│   │   ├── dashboard/         # User dashboard
│   │   ├── docs/              # Documentation page
│   │   ├── flow-builder/      # Main flow builder
│   │   ├── flows/             # Flow management
│   │   ├── templates/         # Template library
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   ├── components/
│   │   ├── layout/            # Layout components
│   │   │   ├── Header.tsx     # Main header
│   │   │   ├── Sidebar.tsx    # Navigation sidebar
│   │   │   └── Footer.tsx     # Footer component
│   │   └── flow-builder/      # Flow builder components
│   │       ├── FlowBuilder.tsx        # Main builder canvas
│   │       ├── BlockLibrary.tsx       # Block library sidebar
│   │       ├── FlowToolbar.tsx        # Builder toolbar
│   │       ├── NodePanel.tsx          # Node configuration panel
│   │       ├── AIWorkflowChat.tsx     # AI planner interface
│   │       ├── ValueSelector.tsx      # Variable/constant selector
│   │       ├── VariableSelector.tsx   # Variable selection
│   │       ├── TypeSelector.tsx       # Data type selector
│   │       ├── VariableDeclarationPanel.tsx # Variable declaration
│   │       └── nodes/                 # Individual node components
│   │           ├── StartNode.tsx      # Flow start node
│   │           ├── BlockchainNode.tsx # Blockchain operations
│   │           ├── LLMNode.tsx        # AI/LLM operations
│   │           ├── MarketDataNode.tsx # Market data fetching
│   │           ├── SmartContractReadNode.tsx  # Smart contract reads
│   │           ├── SmartContractWriteNode.tsx # Smart contract writes
│   │           ├── TimerNode.tsx      # Timer operations
│   │           ├── ConditionalNode.tsx # Conditional logic
│   │           ├── ArithmeticNode.tsx # Mathematical operations
│   │           ├── VariableNode.tsx   # Variable operations
│   │           ├── TelegramNode.tsx   # Telegram notifications
│   │           ├── UserApprovalNode.tsx # User approval workflows
│   │           ├── LoggerNode.tsx     # Logging operations
│   │           ├── LoopNode.tsx       # Loop operations
│   │           └── CustomNode.tsx     # Custom operations
│   ├── hooks/                 # Custom React hooks
│   │   ├── useAuth.ts         # Authentication hook
│   │   └── useFlows.ts        # Flow management hook
│   ├── lib/                   # Utility libraries
│   │   ├── supabase.ts        # Supabase client
│   │   └── utils.ts           # General utilities
│   └── utils/                 # Additional utilities
├── public/                    # Static assets
│   ├── agentpad-logo.svg      # Main logo
│   ├── agentpad-icon.svg      # Icon version
│   └── favicon.ico            # Favicon
├── middleware.ts              # Next.js middleware
├── next.config.ts             # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies
```

## 🛠️ Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (for authentication and database)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd agentpad-frontend

# Install dependencies
npm install

# Set up environment variables
cp env-template.txt .env.local
# Edit .env.local with your configuration
```

### Environment Variables

```bash
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Backend Configuration (Optional)
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001

# AI Planner Configuration (Optional)
NEXT_PUBLIC_OPENAI_API_KEY=your-openai-api-key
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
```

## 🎨 Available Node Types

### Core Logic Nodes
- **Start Node** - Flow entry point with variable initialization
- **Conditional Node** - If-then-else logic with comparison operators
- **Arithmetic Node** - Mathematical operations (add, subtract, multiply, divide)
- **Variable Node** - Set, get, increment, and decrement variables
- **Timer Node** - Delay, interval, and timeout operations
- **Loop Node** - For, while, and forEach loop operations
- **Logger Node** - Log messages during flow execution

### Blockchain Nodes
- **Blockchain Node** - SEI blockchain operations with 30+ available tools
- **Smart Contract Read Node** - Read operations on smart contracts
- **Smart Contract Write Node** - Write operations on smart contracts
- **Market Data Node** - Real-time token price fetching

### AI & Communication Nodes
- **LLM Node** - AI-powered analysis with GPT-4, GPT-5, and other models
- **Telegram Node** - Send notifications and interactive messages
- **User Approval Node** - Wait for user approval before proceeding

### Custom Nodes
- **Custom Node** - Extensible node for custom operations

## 🔗 Blockchain Operations

### Basic Operations (All Networks)
- **Token Balance** - Get ERC-20 and NFT balances
- **Token Transfer** - Transfer ERC-20 tokens and NFTs
- **Native Transfer** - Transfer native SEI tokens
- **NFT Minting** - Mint new NFTs

### DeFi Operations (Mainnet Only)
- **Symphony** - Token swapping and liquidity operations
- **Takara** - Lending and borrowing operations
- **Staking** - SEI token staking and unstaking

### Trading Operations (Mainnet Only)
- **Citrex** - Advanced trading operations including:
  - Order placement and management
  - Balance and position tracking
  - Market data and order books
  - Account health monitoring

### Strategy Operations (Mainnet Only)
- **Carbon** - Advanced trading strategies including:
  - Buy/sell strategy creation
  - Overlapping strategy management
  - Strategy updates and deletion

## 🤖 AI Models

The LLM Node supports multiple OpenAI models:

### Current Models
- **GPT-4o-mini** - Fast and efficient (default)
- **GPT-4o** - Advanced reasoning and analysis
- **GPT-4.1** - Latest GPT-4 iteration
- **GPT-4.1-mini** - Efficient GPT-4.1 variant
- **GPT-4 Turbo** - Legacy GPT-4 with turbo optimization
- **GPT-4** - Legacy GPT-4 model

### Future Models
- **GPT-5** - Next-generation AI model
- **GPT-5-mini** - Efficient GPT-5 variant

## 🔧 Usage

### Creating a Flow

1. **Access Flow Builder** - Navigate to `/flow-builder`
2. **Add Nodes** - Drag nodes from the Block Library to the canvas
3. **Connect Nodes** - Draw connections between node handles
4. **Configure Nodes** - Click nodes to configure their settings
5. **Test Flow** - Use the AI Planner or manual testing
6. **Save Flow** - Save to database or export as JSON

### Using AI Workflow Planner

1. **Open AI Planner** - Click the "AI Plan" button in the toolbar
2. **Describe Workflow** - Write your workflow requirements in natural language
3. **Configure Options** - Choose whether to include LLM nodes
4. **Generate Flow** - AI creates a complete workflow
5. **Review & Modify** - Adjust the generated flow as needed

### Node Configuration

Each node type has its own specialized configuration panel:

- **Blockchain Nodes**: Network selection, tool choice, and parameter configuration
- **LLM Nodes**: Model selection, prompt configuration, and input/output variables
- **Smart Contract Nodes**: ABI input, method selection, and parameter mapping
- **Timer Nodes**: Duration, unit selection, and repeat configuration
- **Conditional Nodes**: Comparison operators and value configuration

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
- **Netlify** - Static site hosting with form handling
- **AWS Amplify** - Full-stack hosting with CI/CD
- **Google Cloud Run** - Containerized deployment
- **Docker** - Container deployment with custom configuration

## 🔗 Backend Integration

The frontend is designed to work with the **AgentPad Backend**:

1. **Build Flows** - Use the visual builder to create flows
2. **Export JSON** - Download flow configuration as JSON
3. **Execute via CLI** - Run flows using `npm run agentpad start flow_name`
4. **Monitor Results** - View execution logs and results

### Backend Communication

The frontend generates flow JSON that can be executed by the backend CLI:

```bash
# Execute a flow
npm run agentpad start my_flow

# Execute multiple flows
npm run agentpad start flow1 flow2

# Check flow status
npm run agentpad status
```

## 🔒 Security

- **Client-side Security** - No sensitive operations in frontend
- **Environment Variables** - Secure configuration management
- **Supabase Auth** - Secure user authentication with Row Level Security
- **CORS Protection** - Configured for secure backend communication
- **Input Validation** - Comprehensive validation for all user inputs

## 🧪 Testing

```bash
# Run linting
npm run lint

# Type checking (built into build process)
npm run build

# Manual testing
# - Test all node types
# - Verify blockchain operations
# - Check AI planner functionality
# - Validate flow export/import
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details.

## 🔗 Related Repositories

- **[AgentPad Backend](https://github.com/Harsh8196/agentpad-backend)** - Standalone CLI execution engine
- **[sei-agent-kit](https://github.com/sei-protocol/sei-agent-kit)** - SEI blockchain integration library

## 🆘 Support

For support and questions:
- Check the documentation at `/docs`
- Review the template library for examples
- Use the AI Workflow Planner for guidance
- Contact the development team
