export const settingUI = () => {
    /* https://logseq.github.io/plugins/types/SettingSchemaDesc.html */
    const settingsTemplate = [
        {
            key: "jsonUrl",
            type: "string",
            default: ``,
            title: "変換用サイトで、コピーしたURLを貼り付けてください。",
            description: "追加更新の方法について [空欄にしてから📚を押すと変換用サイトが開きます。そこにもう一度アップロードしてその新しいURLを貼り付けてください。次の項目で[Rewrite]を選択して📚を押すと実行されます。既存の上書きはおこなわれません。]",
        },
        {
            key: "deleteMode",
            type: "enum",
            default: "",
            enumChoices: ["","Rewrite","Delete"],
            enumPicker: "select",
            title: "追加・削除モード",
            description: "[Delete]を選択して📚を押すと書籍の関連ページが全部削除されます。(ジャーナルページに書いた内容は消えません)",
        },
        {
            key: "listTitle",
            type: "object",
            inputAs: "hidden",
            default: "",
            title: " ",
            description: "`Edit setting.json`で作成された書籍ページの一覧をファイルで確認できます。※削除モード用のリストです。",
        },
        {
            key: "listPublisher",
            type: "object",
            inputAs: "hidden",
            default: null,
            title: null,
            description: null,
        },
        {
            key: "listAuthor",
            type: "object",
            inputAs: "hidden",
            default: null,
            title: null,
            description: null,
        },
    ];
    logseq.useSettingsSchema(settingsTemplate);
};


/*JavascriptではなくPHPで処理することにした
, {
            key: "limitTags",
            type: "string",
            default: ``,
            title: "タグ (デフォルトは無記入)",
            description: `コンマ「,」で区切ってタグを入力する。一致したものだけ書籍ページが作成されます。(すでに作成済みの場合は、この設定は無効です)`,
        }
,{
    key: "limitCategory",
    type: "string",
    default: ``,
    title: "カテゴリ (デフォルトは無記入)",
    description: `コンマ「,」で区切ってカテゴリを入力する。一致したものだけ書籍ページが作成されます。(すでに作成済みの場合は、この設定は無効です)`,
}
*/