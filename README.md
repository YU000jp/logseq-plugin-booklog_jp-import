🚩Non Published on logseq marketplace.

# logseq-plugin-booklog_jp-import
 - Create a booklist by import from https://booklog.jp/

## what can  do
- This plugin processes the content of data exported by [`booklog.jp`](https://booklog.jp/). it's a site from Japan.
- Load a exported file and create pages. Configure page properties.
- ブクログのファイルエクスポートを利用し、Logseqにブックリストを作成するプラグイン

## プラグインをつかう手順
1. Logseqマーケットプレイスからプラグインをインストールする (`booklog_jp-import`で探す)
1. ブクログからCSVファイルを取得する(ダウンロード) https://booklog.jp/export
1. http://yu000jp.php.xdomain.jp/main/booklog/logseq/ にファイルをアップロードして、発行されたURLをコピーする
1. プラグインの設定項目にURLを貼り付ける
1. ツールバーにある`📚`からプラグインを実行する
1. ネット上に作成されたJSONファイルが読み込まれ、Logseqにページが作成される
1. `本/〇〇〇〇`という形式で、作成される
1. グラフの再読み込み(`reindex`)をおこなう

## 作成された書籍のページを開く
3種類の方法
- `本`というページを開いて、書籍ページのリンクを見つける(Hierarchyと呼ばれるリンクが表示されている)
- 左サイドバーの`全ページ`を開き、作成されたページファイルを確認する
- クエリーテーブルから見つける　※別途、方法を記載予定

## 読書記録をつける
1. Logseqにログを書き足すには、ジャーナルに書く
1. タグ`#[[〇〇〇〇]]`を使ってリンクをつける、アウトライン形式で書いていく
1. 書籍ページにあるLinked Referencesでログを見つける
1. Logseqで関連のあるページのUnlinked Referencesに表示される
 
### How to install
- Seek for this`booklog_jp-import` on Logseq marketplace
- If you use Logseq `Developer mode`https://github.com/YU000jp/logseq-plugin-booklog_jp-import/releases
 
--- 
 
## Code (plugin develop)
- This plugin is reusable as a logseq plugin.
 
### Comment
- Since my technical skills are still lacking, I will publish it in this way. Many Logseq plugins are powered by Javascript, node.js, Typescript, React, etc. This time we have a separate website and a server-side PHP script that does what we need to do.

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
