🚩Non Published on logseq marketplace. 

# logseq-plugin-booklog_jp-import
 - Create a booklist by import from [`booklog.jp`](https://booklog.jp/)

## what can  do
- Load a exported file and create pages. Configure page properties.
- To use Logseq as a booklist.
- booklog.jp is a site from Japan.
- ブクログ/booklog.jpのファイルエクスポートを利用し、Logseqにブックリストを作成してログを残すためのプラグイン

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
 
 ## Plugin develop
 - まだ自分自身の技術不足があり、今回の方法で公開します。
 - 多くのLogseqプラグインは、Javascriptやnode.js、Typescript、Reactなどの技術で作成されています。
 - 今回は別のウェブサイトをつくり、サーバーサイドのPHPスクリプトで必要な処理をおこないます。
 
 ### TODO List
 1. add `古いページファイルを削除しない`
 1. LogseqにCSVファイルをアップロードできるようにする(その後の処理も)


### Imported SDK
 - @logseq/libs https://logseq.github.io/plugins/

### Credit
 - https://github.com/hkgnp/logseqplugin-basic-template
 - https://github.com/YU000jp/logseq-plugin-templete-js
