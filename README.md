🚩Non Published on logseq marketplace. 

# logseq-plugin-booklog_jp-import
 - Create a booklist by import from https://booklog.jp/

## what can  do
- This plugin processes the content of data exported by [`booklog.jp`](https://booklog.jp/). it's a site from Japan.
- Load a exported file and create pages. Configure page properties.
- ブクログのファイルエクスポートを利用し、Logseqにブックリストを作成するプラグイン

## How to use
1. ブクログからCSVファイルを取得する(ダウンロード) https://booklog.jp/export
1. http://yu000jp.php.xdomain.jp/main/booklog/logseq/ にアップロードして、URLをコピーする
1. Logseqマーケットプレイスからプラグインをインストールする
1. プラグインの設定項目にURLを貼り付ける
1. ツールバーにある`📚`からプラグインを実行する
1. ネット上に作成されたJSONファイルが読み込まれ、Logseqにページが作成される
1. `本/〇〇〇〇`という形式で、作成される
1. 左サイドバーの`全ページ`を開き、今回作成されたページファイルを確認する
1. Logseqにログを書き足すには、ジャーナルでタグを使う
1. タグ`#[[〇〇〇〇]]`を使い、アウトラインを書く
1. そのページのLinked Referencesに表示される
1. ページを開いてログを探す
 
 ## Tips
 - `本`というページを開くとHierarchyと呼ぶリンクが表示される
 - リンクだけではなくページタグやAdvanced Queryからも各ページへアクセスできる
 
 ## Attention
 - ツールバーから実行すると古いページファイルがいったん削除される
 - ページに直接書かないようにしてください
 - 必ずタグ(リンク)をつけてログを残してください
 
 --- 
 
 ## Code (plugin develop)
  - This plugin is reusable as a logseq plugin.
 
 ### Comment
 - まだ自分自身の技術不足があり、今回の方法で公開します。
 - 多くのLogseqプラグインは、Javascriptやnode.js、Typescript、Reactなどの技術で作成されています。
 - 今回は別のウェブサイトをつくり、サーバーサイドのPHPスクリプトで必要な処理をおこないます。
 
 ### TODO List
 1. add `古いページファイルを削除しない`
 1. LogseqにCSVファイルをアップロードできるようにする(その後の処理も)

 ### How to install
 - Logseq marketplace `booklog_jp-import`
 - logseq `Developer mode`https://github.com/YU000jp/logseq-plugin-booklog_jp-import/releases

### How it works
#### Create a page file in such a format and include it in the page tag
- JSON File example (※UTF-8 encoded)
 ```json
 [
    {
        "item-code": "4309501230",
        "ISBN": "9784309501239",
        "category": "Release",
        "status": "\u8aad\u307f\u7d42\u308f\u3063\u305f",
        "tags": "\u8996\u529b",
        "end": "[[2022\/06\/06]]",
        "title": "\u8996\u529b\u56de\u5fa9\u306e\u30ab\u30ae\u306f\u8133\u306e\u523a\u6fc0\u306b\u3042\u3063\u305f\u2015\u201c\u8996\u529b\u9769\u547d\u201d\u306e\u65b0\u7406\u8ad6\u3068\u305d\u306e\u5b9f\u8df5\u30c8\u30ec\u30fc\u30cb\u30f3\u30b0\u6cd5 (KAWADE\u5922\u65b0\u66f8)",
        "author": "\u4e2d\u5ddd \u548c\u5b8f",
        "publisher": "\u6cb3\u51fa\u66f8\u623f\u65b0\u793e",
        "type": "\u672c",
        "page-number": "184",
        "Cover": "http:\/\/images-jp.amazon.com\/images\/P\/4309501230.09.MZZZZZZZ.jpg",
        "Link": "[amazon.co.jp](https:\/\/www.amazon.co.jp\/dp\/4309501230\/) | [booklog.jp](https:\/\/booklog.jp\/item\/1\/4309501230)"
    },
    {
        "item-code": "4309502121",
        "ISBN": "9784309502120",
        "category": "Release",
        "status": "\u8aad\u307f\u7d42\u308f\u3063\u305f",
        "tags": "\u4e57\u7528\u8eca",
        "end": "[[2022\/06\/06]]",
        "title": "\u7d76\u5bfe\u306b\u5f8c\u6094\u3057\u306a\u3044\u30af\u30eb\u30de\u9078\u3073\u2015\u77e5\u3089\u306a\u3044\u3068\u30d0\u30ab\u3092\u307f\u308b\u3001\u4eca\u3069\u304d\u306e\u30af\u30eb\u30de\u77e5\u8b58 (KAWADE\u5922\u65b0\u66f8)",
        "author": "\u4e0a\u6749 \u6cbb\u90ce",
        "publisher": "\u6cb3\u51fa\u66f8\u623f\u65b0\u793e",
        "type": "\u672c",
        "page-number": "206",
        "Cover": "http:\/\/images-jp.amazon.com\/images\/P\/4309502121.09.MZZZZZZZ.jpg",
        "Link": "[amazon.co.jp](https:\/\/www.amazon.co.jp\/dp\/4309502121\/) | [booklog.jp](https:\/\/booklog.jp\/item\/1\/4309502121)"
    }
]
 ```
 - Use `type` and `title` to determine the page title

### Imported SDK
 - @logseq/libs https://logseq.github.io/plugins/

### Credit
 - https://github.com/hkgnp/logseqplugin-basic-template
