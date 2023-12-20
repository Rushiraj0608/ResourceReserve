# Resource Reserve

## Running Locally

To run this project locally, follow these steps:

1. First, make sure you have the `.env` and `service-account.json` files in your root project directory.
2. Ensure that the value of `GOOGLE_APPLICATION_CREDENTIALS` in your `.env` file points to the correct path of the service-account.json file, i.e., `GOOGLE_APPLICATION_CREDENTIALS=./service-account.json`.
3. Install the project dependencies by running the following command from the root directory:
   ```bash
   npm install
4. Build the project using the following command:
    ```
    npm run build
5. Start the application by running the following command:
    ```
    npm start
## Running with Docker
To run this project using Docker, follow these additional steps:
1. Ensure you have `.env` and `service-account.json` files in your root project directory.
2. Make sure to set the `GOOGLE_APPLICATION_CREDENTIALS` variable to `/app/service-account.json` in your `.env` file when running with Docker.
3. Build the Docker image using the following command:
    ```
    docker build -t resource-reserve .
4. Run the Docker container with the following command:
    ```
    docker run -d -p 3000:3000 --env-file .env -v ./service-account.json:/app/service-account.json resource-reserve
Now, your project should be up and running locally and within a Docker container.