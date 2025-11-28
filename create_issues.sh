#!/bin/bash

# Function to create a GitHub issue
create_issue() {
    local title="$1"
    local body="$2"
    
    echo "Creating issue: $title"
    gh issue create --title "$title" --body "$body"
    
    # Add a small delay to avoid rate limiting
    sleep 2
}

# Change to the repository root
cd "$(dirname "$0")"

# Check if repository is initialized
if [ ! -d ".git" ]; then
    echo "Error: This directory is not a git repository."
    echo "Please initialize git and connect it to GitHub first."
    exit 1
fi

# Check if GitHub remote is set
if ! git remote -v | grep -q "github.com"; then
    echo "Error: GitHub remote not found."
    echo "Please add your GitHub repository as a remote first:"
    echo "git remote add origin https://github.com/your-username/Smet.git"
    exit 1
fi

# Create issues
create_issue "Set Up Frontend Development Environment" "- Set up Next.js with TypeScript
- Add essential dependencies (Wagmi, viem, ethers.js, TailwindCSS)
- Configure ESLint and Prettier
- Set up environment variables
- Create basic project structure"

create_issue "Implement Wallet Connection" "- Add wallet connection using Wagmi
- Support for MetaMask and WalletConnect
- Display connected wallet address and network
- Handle network switching
- Show connection status"

create_issue "Create Main Reward Interface" "- Design and implement the reward opening interface
- Display available rewards
- Show reward details and probabilities
- Add loading states
- Make it mobile-responsive"

create_issue "Implement Contract Interaction" "- Create hooks for contract interaction
- Implement reward opening functionality
- Handle transaction states (pending, success, error)
- Display transaction status
- Show gas estimates"

create_issue "Create Reward Display Component" "- Design component to display won rewards
- Show reward details (type, amount, image)
- Add claim functionality
- Show claim status
- Add animations for reward reveal"

create_issue "Add Error Handling and Notifications" "- Implement error boundaries
- Add toast notifications
- Handle network errors
- Show transaction errors
- Add loading states"

create_issue "Create Admin Dashboard" "- Add admin authentication
- Create interface for managing rewards
- Add/remove reward items
- Update reward probabilities
- View statistics"

create_issue "Add Responsive Styling" "- Implement responsive design
- Add dark/light mode
- Create reusable UI components
- Ensure mobile compatibility
- Add loading skeletons"

create_issue "Set Up Frontend Testing" "- Add Jest and React Testing Library
- Write unit tests for components
- Add integration tests
- Set up CI for testing
- Add test coverage reporting"

create_issue "Add Frontend Documentation" "- Document setup instructions
- Add component documentation
- Document API interactions
- Add contribution guidelines
- Create README with screenshots"

echo "All issues have been created successfully!"
