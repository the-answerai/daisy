{{prompt}}
{{fileContents}}
Summary:
This configuration file is used in a larger application to define various settings and dependencies. It follows a specific schema defined by Turbo Build. The file includes global dependencies, global environment variables, and a pipeline with different stages such as build, lint, and dev.

Service:
The service that this configuration file is for is not explicitly mentioned in the file itself. However, based on the schema URL, it can be inferred that this configuration file is used in conjunction with Turbo Build, which is a build automation service.

Configuration Summary:
The configuration file sets up global dependencies, global environment variables, and a pipeline with different stages. It specifies that the build stage should only output new files, depend on the "build" stage, and include specific output directories. The lint stage has no outputs, and the dev stage depends on the "build" stage and disables caching.

Configuration Breakdown:
- "$schema": Specifies the schema URL for validating the configuration file.
- "globalDependencies": Defines global dependencies using glob patterns to match specific files.
- "globalEnv": Specifies global environment variables.
- "pipeline": Defines the pipeline with different stages.
  - "build": Specifies the build stage with settings such as output mode, dependencies, and outputs.
  - "lint": Specifies the lint stage with no outputs.
  - "dev": Specifies the dev stage with dependencies and caching settings.

Interaction Summary:
This configuration file interacts with the rest of the application by defining dependencies, environment variables, and the pipeline stages. It influences the build process, linting, and development mode.

Developer Questions:
1. How can I add or modify global dependencies?
2. How can I add or modify global environment variables?
3. What is the purpose of each pipeline stage and how do they interact?
4. How can I change the output mode for the build stage?
5. How can I add or modify the outputs for the build stage?
6. How can I enable linting and specify its outputs?
7. How can I modify the dependencies and caching settings for the dev stage?