# Use the "20" tag for Node.js v20
FROM mcr.microsoft.com/devcontainers/javascript-node:20

# Install Git, process tools, lsb-release (common in install instructions for CLIs)
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends git procps lsb-release

# Install GitHub CLI
RUN curl -Lo tmp/ghlinux.tar.gz \
  https://github.com/cli/cli/releases/download/v2.45.0/gh_2.45.0_linux_amd64.tar.gz \
  && tar --strip-components=1 -xf tmp/ghlinux.tar.gz \
  && rm tmp/ghlinux.tar.gz

# Install Smee client
RUN npm install --global smee-client

# Create a 'vscode' user
RUN useradd -m vscode && \
  echo "vscode ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/vscode && \
  chmod 0440 /etc/sudoers.d/vscode && \
  adduser vscode sudo
  
# Clean up
RUN apt-get autoremove -y \
    && apt-get clean -y \
    && rm -rf /var/lib/apt/lists/*