#!/bin/bash

# Exit immediately if any command fails
set -e

echo "🚀 Initializing TypeScript project..."

# Step 1: Initialize npm
npm init -y

# Step 2: Check if TypeScript is installed globally
if command -v tsc &> /dev/null
then
    echo "✅ TypeScript is already installed globally!"
else
    echo "⚠️ TypeScript not found globally. Installing locally..."
    npm install --save-dev typescript
fi

# Step 3: Create tsconfig.json
npx tsc --init

# Step 4: Modify tsconfig.json (Optional: Customizing settings)
sed -i 's/"outDir": ".\/"/"outDir": ".\/dist"/' tsconfig.json
sed -i 's/"rootDir": ".\/"/"rootDir": ".\/src"/' tsconfig.json

# Step 5: Create the src directory and an index.ts file
mkdir -p src
echo 'console.log("Hello, TypeScript! 🚀");' > src/index.ts

# Step 6: Update package.json with scripts
echo "Updating package.json scripts..."
node -e "
const fs = require('fs');
const packageJson = JSON.parse(fs.readFileSync('package.json'));
packageJson.scripts = {
  ...packageJson.scripts,
  'build': 'tsc',
  'start': 'node dist/index.js'
};
fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
"

# Step 7: Ask if the user wants to install ESLint
read -p "Would you like to install ESLint for TypeScript? (y/n): " install_eslint
if [[ "$install_eslint" =~ ^[Yy]$ ]]
then
    echo "📦 Installing ESLint for TypeScript..."
    npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin

    # Create .eslintrc.json
    cat <<EOL > .eslintrc.json
{
  "parser": "@typescript-eslint/parser",
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "env": {
    "es6": true,
    "node": true
  },
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module"
  }
}
EOL

    # Update package.json with lint script
    node -e "
    const fs = require('fs');
    const packageJson = JSON.parse(fs.readFileSync('package.json'));
    packageJson.scripts = {
      ...packageJson.scripts,
      'lint': 'eslint src/**/*.ts'
    };
    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
    "

    echo "✅ ESLint setup complete!"
fi

echo "✅ TypeScript project setup complete!"
echo "Run the following commands to start coding:"
echo "  npm run build  # To compile TypeScript"
echo "  npm start      # To run the compiled JS"
[[ "$install_eslint" =~ ^[Yy]$ ]] && echo "  npm run lint   # To check TypeScript code quality"
