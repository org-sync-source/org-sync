// This adds an event handler that your code will call later. When this event handler is called, it will log the event to the console. Then, it will use GitHub's REST API to add a comment to the pull request that triggered the event.
export async function handlePullRequestOpened({ octokit, payload }, config) {
    try {
        // handle the event if the pull request is for a repository whose name matches the whitelist pattern in the config file but not the blacklist pattern
        if (config.settings.whitelist && !config.settings.whitelist.some((pattern) => new RegExp(pattern).test(payload.repository.name))) {
            console.log(`PR ignored because it's for a repository that does not match the whitelist pattern`);
            return;
        }
        if (config.settings.exceptions && config.settings.exceptions.some((pattern) => new RegExp(pattern).test(payload.repository.name))) {
            console.log(`PR ignored because it's for a repository that matches the blacklist pattern`);
            return;
        }

        console.log(`Received a pull request event for #${payload.pull_request.number}`);
        // await postComment(octokit, payload);
        await openPullRequestInShadowRepos(octokit, payload, config);
    } catch (error) {
        if (error.response) {
            console.error(`Error! Status: ${error.response.status}. Message: ${error.response.data.message}`)
        }
        console.error(error)
    }
};

async function postComment(octokit, payload) {
    // This defines the message that your app will post to pull requests.
    const messageForNewPRs = "Thanks for opening a new PR! Please follow our contributing guidelines to make your PR easier to review.";

    return await octokit.request("POST /repos/{owner}/{repo}/issues/{issue_number}/comments", {
        owner: payload.repository.owner.login,
        repo: payload.repository.name,
        issue_number: payload.pull_request.number,
        body: messageForNewPRs,
        headers: {
            "x-github-api-version": "2022-11-28",
        },
    });
}

async function openPullRequestInShadowRepos(octokit, payload, config) {
    for (const targetOrg of config.settings.shadows) {
        const shadowRepo = `${targetOrg}/${payload.repository.name}`;
        try {
            await octokit.request("POST /repos/{owner}/{repo}/pulls", {
                owner: targetOrg,
                repo: payload.repository.name,
                title: payload.pull_request.title,
                head: payload.pull_request.head.ref,
                base: payload.pull_request.base.ref,
                body: `This pull request was opened in ${payload.repository.full_name} and has been mirrored here for review.`,
                headers: {
                    "x-github-api-version": "2022-11-28",
                },
            });
            console.log(`Opened a pull request in ${shadowRepo}`);
        } catch (error) {
            console.error(`Error opening a pull request in ${shadowRepo}`);
            console.error(error);
        }
    }
}