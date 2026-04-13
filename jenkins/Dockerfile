FROM jenkins/jenkins:lts

# Switch to root to install packages
USER root

# First, remove system eslint package before installing nodejs
# This prevents npm from being a dependency
RUN apt-get update && \
    apt-get remove -y eslint 2>/dev/null || true && \
    rm -f /usr/bin/eslint && \
    rm -rf /usr/share/nodejs/eslint && \
    rm -rf /var/lib/apt/lists/*

# Install Node.js and npm
RUN apt-get update && \
    apt-get install -y \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Double-check: remove any system eslint that might have been installed as a dependency
RUN rm -f /usr/bin/eslint && \
    rm -rf /usr/share/nodejs/eslint && \
    rm -rf /usr/share/doc/eslint* /usr/share/man/man*/eslint* 2>/dev/null || true

# Verify Node and npm are installed
RUN node --version && npm --version && \
    echo "System eslint removed:" && \
    ls /usr/share/nodejs/eslint 2>&1 || echo "✓ No system eslint found (as expected)"

# Switch back to jenkins user
USER jenkins
