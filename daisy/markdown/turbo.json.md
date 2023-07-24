{{prompt}}
{{fileContents}}
Summary:
This configuration file is used in a larger application to define various settings and dependencies for different stages of the application's pipeline, such as build, lint, dev, and test. It follows a specific schema defined by Turbo Build.

Service:
The service that this configuration file is for is not explicitly mentioned in the file itself. However, based on the presence of the ".env.*local" global dependency, it can be inferred that this configuration file is related to a service that uses environment variables for local development.

Configuration Summary:
The configuration file is structured into different sections, each representing a stage in the application's pipeline. It includes global dependencies, global environment variables, and specific configurations for each stage.

Configuration Breakdown:
- "$schema": Specifies the schema for the configuration file.
- "globalDependencies": Defines the global dependencies for the application, using glob patterns to match specific files.
- "globalEnv": Specifies global environment variables.
- "pipeline": Contains configurations for different stages of the application's pipeline.
  - "build": Configuration for the build stage, including the output mode, dependencies, and outputs.
  - "lint": Configuration for the lint stage, with an empty outputs array.
  - "dev": Configuration for the development stage, including dependencies and cache settings.
  - "test": Configuration for the test stage, including dependencies and cache settings.

Interaction Summary:
This configuration file interacts with the rest of the application by defining dependencies, environment variables, and specific settings for each stage of the pipeline. It ensures that the application is built, linted, and tested correctly based on the defined configurations.

Developer Questions:
1. What is the purpose of the globalDependencies array and how do I add or modify dependencies?
2. How can I add or modify environment variables using the globalEnv array?
3. What is the significance of the outputMode in the build stage and how does it affect the application's output?
4. How can I add or modify the dependencies for each stage of the pipeline?
5. What is the purpose of the cache setting in the dev and test stages, and how does it impact the application's performance?
6. How can I customize the outputs for the build stage to include or exclude specific files or directories?
7. How can I add additional stages to the pipeline and configure their settings?