# QA Automation Engineer Challenge

## Testing Approach and Framework Decisions

This test automation project is built using Playwright with TypeScript due to its modern API, cross-browser capabilities, and native support for fixtures and parallel test execution.

The challenge was built following this structure:

```
📁 portrait-qa-automation-test/
├── 📁 app/                  # Next.js application
│   ├── 📁 login/            # Login page
│   ├── 📁 dashboard/        # Dashboard page
│   ├── 📁 products/         # Product management
│   ├── 📁 inventory/        # Inventory management
│   └── 📁 lib/              # Utility functions
├── 📁 pages/                # Page Object Models
│   ├── 📄 dashboard.page.ts    
│   ├── 📄 inventory.page.ts
│   ├── 📄 login.page.ts
│   └── 📄 products.page.ts
├── 📁 tests/                # Test specifications
│   ├── 📁 challenges/      
│   │   ├── 📄 authentication.spec.ts  # Login tests
│   │   ├── 📄 example-product-lifecycle.spec.ts # Example test (adjusted)
│   │   ├── 📄 inventory.spec.ts   # Inventory tests
│   │   └── 📄 products.spec.ts    # Products tests
│   ├── 📁 fixtures/
│   │   ├── 📄 auth.spec.ts        # Fixture to ensure authentication during the test execution
│   │   └── 📄 base.ts             # Implements traking on requests and creates a json file with the response in case of failure
│   ├── 📁 helpers/
│   │   └── 📄 test-helpers.ts     # Utility functions
│   ├── 📄 example.spec.ts         # Example test (adjusted)
├── 📁 data/
│   └── 📄 test-products.json
│   └── 📄 products.json           # Products used in bulk tests
└── 📄 playwright.config.ts        # Playwright configuration
```

## Assumptions About the Application Behavior

- The application requires user authentication to access protected routes.
- Valid credentials are stored in environment variables (USER_EMAIL, USER_PASSWORD).
- Once logged in, the fixture auth keeps session data (localStorage + cookies) valid for the duration of the test suite.
- It is necessary to run the setup project before running the test suite.

## Instructions to Run the Test Suite

1. **Clone this repository**:
```bash
git clone https://github.com/RobertoLopes33/Portrait-QA-Automation-Engineer-Challenge.git
```

2. **Install dependencies**:
```bash
cd portrait-qa-automation-challenge
npm install
```

3. **Set environment variables at .env file**:
- BASE_URL
- ADMIN_EMAIL
- ADMIN_PASSWORD
- USER_EMAIL
- USER_PASSWORD

4. **Run the setup project**:
```bash
npm run setup:auth
```

⚠️ **Note**: The setup project must be run before running the test suite.

5. **Run the test suite to generate authentication state**:
```bash
npm test
```

6. **Run specific suite by playwright grep**:
```bash
npx playwright test --grep "\[suite\]"
```

## Test Coverage Strategy and Prioritization

Testing priorities are aligned to best pratices on testing and risk-based coverage:

| Priority | Area            | Type of Tests           | Example                                          |
| -------- | --------------- | ----------------------- | ------------------------------------------------ |
| High     | Authentication  | Functional / Negative   | Invalid credentials                              |
| High     | Core workflows  | E2E                     | Dashboard, product and inventory lifecycles      |
| Medium   | UI regression   | Visual + DOM assertions | Layout consistency, element visibility           |
| Low      | Edge cases      | Exploratory             | Uncommon user errors                             |

## Challenges Faced and Solutions Implemented

### Challenges

- Authentication state lost during tests
- Environment setup inconsistency across users
- Test flakiness from timing issues
-

### Solutions

- Implemented a persistent login fixture using storageState and .auth/user.json.
- Introduced a .env configuration.
- Used Playwright’s auto-waiting and assertions with locators.
- Parameterized baseURL and credentials using environment variables.

## Suggestions for Future Test Improvements

- Integrate test execution with CI/CD pipelines.
- Implement multi-browser testing (firefox, webkit)
- Add visual regression tests using Playwright’s screenshot comparison.
- Extend coverage to API endpoints for faster feedback loops.
- Introduce custom reporting dashboards.

## AI Usage disclaimer

This project was built mostly hands-on, with the help of ChatGPT and Windsurf AI, to assist in the development process. The AI tools were used to auto-complete code, provide suggestions and best practices, to find specific playwright methods that alling with the objective of the test, but the final implementation and testing were done by me.

## Final note

I really enjoyed creating this project. I've tried to cover all the tasks proposed by the challenge, but some of them were not possible to be covered due to the time, like CI/CD integration and multy-browser testing. 