# Temporal RPA Engine

An RPA (Robotic Process Automation) workflow orchestration engine based on Temporal, using Playwright for browser automation.

## Project Architecture

The project adopts a monorepo architecture, consisting of the following main modules:

- **Designer**: React frontend application providing a visual workflow design interface
- **API Service**: NestJS application handling frontend requests and interacting with Temporal
- **Worker**: Temporal Worker executing RPA workflows and activities
- **Shared Library**: Shared types, interfaces, and utilities

## Technology Stack

- **Frontend**: React, TypeScript, Ant Design, React Flow
- **Backend**: NestJS, TypeScript
- **Workflow**: Temporal, TypeScript
- **Browser Automation**: Playwright
- **Package Management**: pnpm

## Quick Start

### make commands

```bash
make install
make start-all

# show help
make help
```

### Install Dependencies

```bash
# Install project dependencies
pnpm install
```

### Run Temporal Service

Temporal is the core component of the workflow engine. Start the Temporal service first.

```bash
# Start Temporal service (development mode)
pnpm temporal:dev-server
```

This command will start a local Temporal development server, with data saved in the `temporal.db` file.

### Start API Service

```bash
pnpm start:api
```

The API service will run on http://localhost:3001, providing REST API interfaces.

### Start Worker

```bash
pnpm start:worker
```

The Worker will connect to the Temporal service and register workflows and activities.

### Start Frontend Designer

```bash
pnpm start:designer
```

The designer will run on http://localhost:3000.

## Features

- Visual workflow designer with drag-and-drop nodes and connections
- Support for various RPA operation types:
  - Browser operations (navigation, clicking, typing, etc.)
  - Delays
  - API calls
  - JavaScript script execution
  - Conditional branches
- Workflow execution status monitoring
- Reliable workflow execution based on Temporal
  - Support for long-running workflows
  - Automatic retry of failed activities
  - Workflow execution history records

## Configuration

### API Service Configuration

Edit the `packages/api/src/main.ts` file to modify port and other configurations.

### Worker Configuration

Edit the `packages/worker/src/worker.ts` file to modify Temporal connection and other configurations.

### Designer Configuration

Edit the `packages/designer/vite.config.ts` file to modify frontend service configurations.

## Development Guide

### Creating New Node Types

1. Add new node types in the `packages/shared/src/types.ts` file
2. Implement handling logic in `packages/worker/src/workflows/rpa-workflow.ts`
3. Add node UI and property forms in the designer

### Adding New Browser Actions

To add new browser automation capabilities:

1. Define new action types in `packages/shared/src/types.ts`
2. Implement the action in `packages/worker/src/activities/browser-activities.ts`
3. Update the UI form in the designer to support configuration of the new action

### Custom Script Support

The RPA engine supports executing custom JavaScript code through the Script node:

1. Scripts run in the Temporal Worker context
2. Scripts can access workflow data and return values
3. Use the Script node for complex logic that isn't supported by built-in node types

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
