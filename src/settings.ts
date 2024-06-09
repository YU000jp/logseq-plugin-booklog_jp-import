import { SettingSchemaDesc } from "@logseq/libs/dist/LSPlugin.user"

/* https://logseq.github.io/plugins/types/SettingSchemaDesc.html */
export const settingsTemplate = (): SettingSchemaDesc[] => [
  {
    key: "deleteMode",
    type: "enum",
    default: "Write",
    enumChoices: ["OFF","Update", "Add", "Delete"],
    enumPicker: "radio",
    title: "モード [修復]・[追加]・[削除]",
    description: "実行するには各モードを選び、ツールバーの📚を押してください。[Update]はすでに存在する場合、そのページのブロックをすべて削除し、ページを作り直します。[Add]ではすでに存在する場合、そのページに対して処理をおこないません。[Delete]では、このプラグインによって作成されたページをすべて削除します。別のページからリンクしている内容に影響はありません。",
  },
  {
    key: "limitTags",
    type: "string",
    default: ``,
    title: "タグ指定 (無記入でOKです)",
    description: `コンマ「,」で区切って複数選択。ブクログで登録したタグに一致したものだけが作成されます。(修復モードを実行したときに反映されます)`,
  },
  {
    key: "limitCategory",
    type: "string",
    default: ``,
    title: "カテゴリ指定 (無記入でOKです)",
    description: `コンマ「,」で区切って複数選択。ブクログで登録したタグに一致したものだけが作成されます。(修復モードを実行したときに反映されます)`,
  },
  {
    key: "listTitle",
    type: "object",
    inputAs: undefined,
    default: "",
    title: " ",
    description: "`Edit setting.json`ボタンを押すと、リストデータを確認できます (※削除モードのためのリスト)",
  },
  {
    key: "listAuthor",
    type: "object",
    inputAs: undefined,
    default: null,
    title: "",
    description: "",
  },
]