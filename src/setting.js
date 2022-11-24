export const settingUI = () => {
    /* https://logseq.github.io/plugins/types/SettingSchemaDesc.html */
    const settingsTemplate = [
        {
            key: "jsonUrl",
            type: "string",
            default: ``,
            title: "Converted .csv to .json",
            description: `変換用サイトで、コピーしたURLを貼り付けてください。`,
        }
    ];
    logseq.useSettingsSchema(settingsTemplate);
};