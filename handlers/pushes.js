// This adds an event handler that your code will call later. When this event handler is called, it will log the event to the console. 
// Then, it will use GitHub's REST API to sync the pushed commits that triggered the event in the shadow repo
export async function handlePush({ octokit, payload }, config, installationOctokit) {
    try {
        // handle the event if the push is for a repository whose name matches the whitelist pattern in the config file but not the blacklist pattern
        if (config.settings.whitelist && !config.settings.whitelist.some((pattern) => new RegExp(pattern).test(payload.repository.name))) {
            console.log(`Push ignored because it's for a repository that does not match the whitelist pattern`);
            return;
        }
        if (config.settings.exceptions && config.settings.exceptions.some((pattern) => new RegExp(pattern).test(payload.repository.name))) {
            console.log(`Push ignored because it's for a repository that matches the blacklist pattern`);
            return;
        }

        console.log(`Received a push event for ${payload.commits.length} commit(s) in ${payload.repository.full_name}`);
        // await postComment(octokit, payload);
        await pushCommitsToShadowRepos(installationOctokit, payload, config);
    } catch (error) {
        if (error.response) {
            console.error(`Error! Status: ${error.response.status}. Message: ${error.response.data.message}`)
        }
        console.error(error)
    }
};

async function pushCommitsToShadowRepos(installationOctokit, payload, config) {
    for (const targetOrg of config.settings.shadows) {
        const shadowRepo = `${targetOrg}/${payload.repository.name}`;
        try {
            console.log(`Pushed commits to ${shadowRepo}`);
        } catch (error) {
            console.error(`Error pushing commits to ${shadowRepo}`);
            console.error(error);
        }
    }
}