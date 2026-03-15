# # Use the Jenkins image as the base image
# FROM jenkins/jenkins:lts

# # Switch to root user to install dependencies
# USER root

# # Install prerequisites and Docker
# RUN apt-get update -y && \
#     apt-get install -y \
#     apt-transport-https \
#     ca-certificates \
#     curl \
#     gnupg \
#     software-properties-common && \
#     curl -fsSL https://download.docker.com/linux/debian/gpg | apt-key add - && \
#     echo "deb [arch=amd64] https://download.docker.com/linux/debian bookworm stable" > /etc/apt/sources.list.d/docker.list && \
#     apt-get update -y && \
#     apt-get install -y docker-ce docker-ce-cli containerd.io && \
#     apt-get clean

# # Add Jenkins user to the Docker group (create if it doesn't exist)
# RUN groupadd -f docker && \
#     usermod -aG docker jenkins

# # Create the Docker directory and volume for DinD
# RUN mkdir -p /var/lib/docker
# VOLUME /var/lib/docker

# # Switch back to the Jenkins user
# USER jenkins



FROM jenkins/jenkins:lts

USER root

# RUN apt-get update -y && \
#     apt-get install -y \
#     apt-transport-https \
#     ca-certificates \
#     curl \
#     gnupg && \
#     python3 \
#     python3-pip \
#     python3-venv && \
#     install -m 0755 -d /etc/apt/keyrings && \
#     curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc && \
#     chmod a+r /etc/apt/keyrings/docker.asc && \
#     echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian trixie stable" > /etc/apt/sources.list.d/docker.list && \
#     apt-get update -y && \
#     apt-get install -y docker-ce docker-ce-cli containerd.io && \
#     apt-get clean


RUN apt-get update -y && \
    apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    python3 \
    python3-pip \
    python3-venv && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://packages.cloud.google.com/apt/doc/apt-key.gpg | gpg --dearmor -o /usr/share/keyrings/cloud.google.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" > /etc/apt/sources.list.d/google-cloud-sdk.list && \
    apt-get update -y && \
    apt-get install -y google-cloud-sdk google-cloud-sdk-gke-gcloud-auth-plugin kubectl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install Docker
RUN install -m 0755 -d /etc/apt/keyrings && \
    curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc && \
    chmod a+r /etc/apt/keyrings/docker.asc && \
    echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian trixie stable" > /etc/apt/sources.list.d/docker.list && \
    apt-get update -y && \
    apt-get install -y docker-ce docker-ce-cli containerd.io && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*


RUN groupadd -f docker && \
    usermod -aG docker jenkins

RUN mkdir -p /var/lib/docker
VOLUME /var/lib/docker

USER jenkins