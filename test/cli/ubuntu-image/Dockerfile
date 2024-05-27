# Use a base image
FROM ubuntu:20.04

# Define arguments with default values
ARG APP_DIR=/app
ARG DATA_DIR=/data

# Environment variables to configure behavior
ENV HOME=/root \
  APP_ENV=production \
  DATA_VOLUME=/data

# Layer: Update and install dependencies
RUN apt-get update && apt-get install -y \
  curl \
  nano

# Layer: Create directories
RUN mkdir /app && mkdir /data

# Layer: Add files
COPY sample.txt /app/
COPY config.json /data/

# Layer: Modify files
RUN echo "Adding new content to sample.txt" >> /app/sample.txt
RUN echo '{"key":"new value"}' >> /data/config.json

# Layer: Add multiple files and remove one
COPY testfile1.txt /app/
COPY testfile2.txt /data/
RUN rm /app/sample.txt

# Layer: Create a directory and move files around
RUN mkdir /app/newdir && mv /data/testfile2.txt /app/newdir/

# Layer: Create a 500KB file with zeros
RUN dd if=/dev/zero of=/app/five_hundred_kb_file bs=1K count=500

# Layer: Install more packages and clean up
RUN apt-get install -y git && apt-get clean

# Layer: Final changes and cleanup
RUN touch /app/finalfile.txt && echo "Final touches" > /app/finalfile.txt
RUN find / -name "*.txt" -type f -delete

# Command to run
CMD ["echo", "Dockerfile build complete."]
