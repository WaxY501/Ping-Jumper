let unpatch = null;
let retryTimer = null;

function findButtonArray(node, seen = new Set()) {
    if (!node || typeof node !== "object" || seen.has(node)) return null;
    seen.add(node);

    if (Array.isArray(node)) {
        for (const child of node) {
            const found = findButtonArray(child, seen);
            if (found) return found;
        }
        return null;
    }

    const children = node.props?.children;

    if (Array.isArray(children)) return children;

    if (children && typeof children === "object") {
        return findButtonArray(children, seen);
    }

    return null;
}

function installButton() {
    if (unpatch) return;

    const target = vendetta.metro.find(
        module => module?.type?.displayName === "ChatInputRightActions"
    );

    if (!target?.type) return;

    unpatch = vendetta.patcher.after("type", target, (_, tree) => {
        const children = findButtonArray(tree);

        if (!children) return tree;

        if (children.some(child => child?.key === "ping-jumper-test")) {
            return tree;
        }

        const React = vendetta.metro.common.React;
        const RN = vendetta.metro.common.ReactNative;

        children.unshift(
            React.createElement(
                RN.Pressable,
                {
                    key: "ping-jumper-test",
                    accessibilityRole: "button",
                    accessibilityLabel: "Ping Jumper",
                    onPress: () => {
                        RN.Alert.alert(
                            "Ping Jumper",
                            "The button is working!"
                        );
                    },
                    style: {
                        width: 36,
                        height: 40,
                        alignItems: "center",
                        justifyContent: "center"
                    }
                },
                React.createElement(
                    RN.Text,
                    {
                        style: {
                            fontSize: 20,
                            color: "#b5bac1"
                        }
                    },
                    "↥"
                )
            )
        );

        return tree;
    });

    clearInterval(retryTimer);
    retryTimer = null;
}

export default {
    onLoad() {
        installButton();

        retryTimer = setInterval(installButton, 1000);
    },

    onUnload() {
        if (retryTimer) clearInterval(retryTimer);
        retryTimer = null;

        if (unpatch) unpatch();
        unpatch = null;
    }
};
