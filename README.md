# Env

This project was developed using node v10.16, so no guarantee it'll work on lower versions.
This project uses yarn, however npm most likely will work too.

# Starting

`yarn install`

`yarn start`

# Testing

`yarn test`

# Contributing and style

The project uses prettier with default configuration, without eslint. 
All code is written in TS, though JS can be used.
Some style settings are committed to .idea folder, for WebStorm users.

# Extra task (slack integration)

Presentation: https://slides.com/malcoriel/reddit-notifier

# Intentionally not implemented
1. Persistence and shared storage
    * All data is stored in memory, and will be lost on stop.
    * The interfaces are designed with async in mind, so it's enough to just swap the implementation.
    * Cannot launch more than one replica to share data.
    * At the same time, no need to synchronize scheduling between replicas.
2. Deployment and optimization
    * No dockerization.
    * No pre-building or bundling of TS.
3. Proper DI and container 
    * Locator is very crude and requires quite a bit of boilerplate.
4. OAuth for reddit
    * Data is fetched via bot account.
    * So, no customization of results for NSFW posts or other view settings.
    * Also, no access to private subreddits (unless the bot gets an invitation).
5. Resilience against reddit failures or rate limiting
    * There are currently no retries or caching for fetching data.
    * The current limit of 30 requests per minute is not respected.
6. Proper secrets management
    * Credentials for the app are hardcoded for easier testing and startup.
7. Configuration
    * Concurrency for various parallel tasks is not configurable and is set to 4
    * Internal check interval is not configurable and is set to 1 minute
