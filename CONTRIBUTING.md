# Contributing to Trash Trade

First off, thank you for considering contributing to Trash Trade! We're thrilled you're interested in helping us build a better platform. Every contribution, whether it's a bug report, a feature suggestion, or a code enhancement, is highly valued.

Before you begin, please take a moment to read through these guidelines.

## Code of Conduct

To ensure a welcoming and inclusive environment, we have established a [Code of Conduct](CODE_OF_CONDUCT.md). We expect all contributors to adhere to it in all project-related interactions.

## How Can I Contribute?

### Reporting Bugs

If you encounter a bug or unexpected behavior:
1.  **Search existing issues** on GitHub to see if the bug has already been reported.
2.  If it hasn't, **create a new issue**.
3.  Use the "Bug Report" template if available. Otherwise, please ensure your report includes:
    * A clear and descriptive title.
    * Step-by-step instructions to reproduce the issue.
    * What you expected to happen (Expected Behavior).
    * What actually happened (Actual Behavior).
    * Screenshots or videos, if relevant.
    * Your environment details (e.g., browser version, OS).

### Suggesting Enhancements

If you have an idea for a new feature or an improvement:
1.  **Create a new issue** on GitHub.
2.  Use the "Feature Request" template if available.
3.  Clearly describe your idea:
    * What problem does this feature solve?
    * How does your proposed solution work?
    * Have you considered any alternative solutions?

### Your First Code Contribution

Ready to write some code? Here is the workflow we recommend for submitting changes via a Pull Request.

1.  **Fork the Repository**
    Click the "Fork" button at the top-right corner of the GitHub page to create a personal copy of this repository.

2.  **Clone Your Fork**
    Clone your forked repository to your local machine.
    ```bash
    git clone [https://github.com/YOUR_USERNAME/recycling-waste-webapp.git](https://github.com/YOUR_USERNAME/recycling-waste-webapp.git)
    cd recycling-waste-webapp
    ```

3.  **Set Up the Development Environment**
    Ensure you have followed all the installation and setup steps described in the main [README.md](README.md#getting-started) to get the backend and frontend running.

4.  **Create a New Branch**
    Always create a new branch from `main` for your work. Use a descriptive branch name.
    ```bash
    # For a new feature
    git checkout -b feat/email-notification-system

    # For a bug fix
    git checkout -b fix/driver-login-issue
    ```

5.  **Make Your Changes**
    Write your code. Be sure to follow the existing code style. Add comments for any complex logic.

6.  **Commit Your Changes**
    We follow the **Conventional Commits** standard for our commit messages. This helps us maintain a clean and readable version history. The format is `type(scope): short description`.
    * **type:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.
    * **scope (optional):** The part of the project you're changing (e.g., `auth`, `pickup`, `frontend`, `backend`).

    **Commit Message Examples:**
    ```bash
    git commit -m "feat(auth): add stronger password validation"
    git commit -m "fix(frontend): correct button layout on redeem page"
    ```

7.  **Push to Your Branch**
    Push your changes to your forked repository on GitHub.
    ```bash
    git push origin your-branch-name
    ```

8.  **Create a Pull Request (PR)**
    * Go to your forked repository on GitHub and click the "Compare & pull request" button.
    * Ensure your branch is set to be merged into the main repository's `main` branch.
    * Provide a clear title for your PR.
    * In the description, explain the changes you made. If your PR resolves an existing issue, link it by writing `Closes #ISSUE_NUMBER`.
    * Include screenshots or GIFs if you made UI changes.

Once you submit your PR, a project maintainer will review it. We may provide feedback or request some changes before it can be merged.

Thank you again for your time and effort!
