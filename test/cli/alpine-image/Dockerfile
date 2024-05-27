# Use a smaller base image
FROM alpine:latest

# Define arguments with default values
ARG APP_DIR=/app
ARG DATA_DIR=/data

# Environment variables to configure behavior
ENV HOME=/root \
  APP_ENV=production \
  DATA_VOLUME=/data

# Layer: Update and install dependencies
RUN apk update && apk add \
  curl \
  nano

# Layer: Create directories using arguments
RUN mkdir ${APP_DIR} && mkdir ${DATA_DIR}

# Layer: Create dummy files instead of copying
RUN echo "Sample text content" > ${APP_DIR}/sample.txt
RUN echo '{"key": "initial value"}' > ${DATA_DIR}/config.json

# Layer: Modify files
RUN echo "Adding new content to sample.txt" >> ${APP_DIR}/sample.txt
RUN echo '{"key":"new value"}' >> ${DATA_DIR}/config.json

# Layer: Create multiple files and then remove one
RUN touch ${APP_DIR}/testfile1.txt
RUN touch ${DATA_DIR}/testfile2.txt
RUN rm ${APP_DIR}/sample.txt

# Layer: Create a directory and move files around
RUN mkdir ${APP_DIR}/newdir && mv ${DATA_DIR}/testfile2.txt ${APP_DIR}/newdir/

# Layer: Create a 500KB file with zeros
RUN dd if=/dev/zero of=${APP_DIR}/five_hundred_kb_file bs=1K count=500

# Layer: Install more packages and clean up
RUN apk add --no-cache git

# Layer: Final changes and cleanup
RUN touch ${APP_DIR}/finalfile.txt && echo "Final touches" > ${APP_DIR}/finalfile.txt
RUN find ${HOME} -name "*.txt" -type f -delete

# Command to run
CMD ["echo", "Dockerfile build complete."]
