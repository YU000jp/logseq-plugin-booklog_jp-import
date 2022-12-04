# logseq-plugin-booklog-jp-import

- Create a booklist by import from <https://booklog.jp/>

## what can  do

- This plugin processes the content of data exported by [`booklog.jp`](https://booklog.jp/). it's a site from Japan.
- Load a exported file and create pages. Configure page properties.
- ブクログのファイルエクスポートを利用し、Logseqにブックリストを作成するプラグイン

## プラグインをつかう手順

1. Logseqマーケットプレイスからプラグインをインストールする (`booklog-jp-import`で探す)
1. ツールバーにある`📚`を押すと、2つのページがブラウザに開かれる
1. ブクログからCSVファイルを取得する(ダウンロード) <https://booklog.jp/export>
1. <http://yu000jp.php.xdomain.jp/main/booklog/logseq/> にファイルをアップロードして、発行されたURLをコピーする
1. プラグインの設定項目にURLを貼り付ける
1. ツールバーにある`📚`を押すと、読み込みが始まり、ページの作成がおこなわれる
1. `本/〇〇〇〇`という形式で、作成される
1. プラグインをオフにする
1. グラフの再読み込み(`reindex`)をおこなう

## 作成された書籍のページを開く

3種類の方法

- `本`というページを開いて、書籍ページのリンクを見つける(Hierarchyと呼ばれるリンクが表示されている)
- 左サイドバーの`全ページ`を開き、作成されたページファイルを確認する
- `ブクログのリスト`というページを開く

## 読書記録をつける

1. Logseqにログを書き足すには、ジャーナルに書く
1. タグ`#[[本/〇〇〇〇]]`を使ってリンクをつける、アウトライン形式で書いていく
1. 書籍ページにあるLinked Referencesでログを見つける
1. Logseqで関連のあるページのUnlinked Referencesに表示される

### How to install

- Seek for this`booklog-jp-import` on Logseq marketplace
- If you use Logseq `Developer mode`<https://github.com/YU000jp/logseq-plugin-booklog_jp-import/releases>

---

## Code (plugin develop)

- This plugin is reusable as a logseq plugin.

### Comment

- Since my technical skills are still lacking, I will publish it in this way. Many Logseq plugins are powered by Javascript, node.js, Typescript, React, etc. This time we have a separate website and a server-side PHP script that does what we need to do.

### How it works

#### Create a page file in such a format and include it in the page tag

- JSON File sample

 ```json
 [
    {
        "ISBN": "9784309501239",
        "status": "Read",
        "tags": "tag01,tag02",
        "end": "2022\/06\/06",
        "title": "book title",
        "author": "author",
        "publisher": "publisher",
        "type": "book",
        "page-number": "184",
    },
    {
        "ISBN": "9784309502120",
        "status": "Read",
        "tags": "tag01,tag02",
        "end": "2022\/06\/06",
        "title": "book title",
        "author": "author",
        "publisher": "publisher",
        "type": "book",
        "page-number": "206"
    }
]
```

- Use `type` and `title` to determine the page title

### Imported SDK

- @logseq/libs <https://logseq.github.io/plugins/>

### Credit

- <https://github.com/hkgnp/logseqplugin-basic-template>
- [icooon-mono.com](https://icooon-mono.com/11122-%e3%81%88%e3%82%93%e3%81%b4%e3%81%a4%e4%bb%98%e3%81%8d%e3%81%ae%e3%83%8e%e3%83%bc%e3%83%88%e3%82%a2%e3%82%a4%e3%82%b3%e3%83%b3/)
