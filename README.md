# MemorizationApplication2
項目を選択するとその暗記シートを生成するアプリ(自分用)

## Features
暗記シートは覚えたい単語を隠し、その単語の説明を表示することにより、使用者に、その説明から単語を出力させる紙面のことである。  

ある「概念名」とその「説明」をどちらも暗記するとき、「概念名」から「説明」を思い出すことと、「説明」から「概念名」を思い出すことはどちらも重要であるが、それらを訓練するには少なくとも二つの紙面が必要である。例えば「硝酸銀(I):AgNO3」という文で「硝酸銀(I)」という名前と「AgNO3」という組成式を覚えたい場合、「X:AgNO3」「硝酸銀(I):X」(隠す部分をXと表している)というように、二つの紙面を用意しなくてはならない。

また、暗記シートを作るうえで、複数の単語が密接に関係していたとき、どう単語を隠せばいいのかという問題がある。例えば「xはyに勝ち、yはzに勝ち、zはxに勝つ」という暗記シートでは、xがグー、yがチョキ、zがパーであることを導き出すのは不可能である。なぜならグーの存在はチョキ、パーが存在しないと成立しないからである。この場合は少なくとも2つの紙面を用意し、「xはチョキに勝ち、パーに負ける」「yはグーに負け、zに勝つ。またzはグーに勝つ」と記述することでこの問題を解決できる。一般に、ある単語を他の隠す単語でしか説明できない場合は必ず紙面が複数になる。

このように、暗記シートでは、覚えるものとものの関係性を重視しなければならない。その関係性は厳密にいえばグラフ構造であるが、ユーザに扱いやすく、コンピュータにも扱いやすい木構造であるとする。(省略しているが、各ノードは概念名と説明のメンバを持つ。)
![木構造](https://user-images.githubusercontent.com/73921483/118429043-c0142100-b70b-11eb-9b16-ace9ebf9ef79.png)  
このアプリは、ユーザーがデータを木構造として入力してもらい、その木構造をlayerに区切り、layerごとに暗記シートを生成する。  
Latex, 画像も表示可能。  
![Layer分け](https://user-images.githubusercontent.com/73921483/118429074-d28e5a80-b70b-11eb-9d3c-69991b164dc3.png)  
UI画面は以下のようになっている。  
![選択画面](https://user-images.githubusercontent.com/73921483/118431870-3d429480-b712-11eb-9d0f-4054829724e3.png)  
![question](https://user-images.githubusercontent.com/73921483/118431878-42074880-b712-11eb-976d-6138705396eb.png)  
![answer](https://user-images.githubusercontent.com/73921483/118431891-4a5f8380-b712-11eb-8c7a-21bf6ac5754f.png)  

## Framework
Vue.js(Vue2)
Node.js  
## Database
MongoDB  
## Plugin
vue-mathjax  
Element UI  
Vuex  
Axios  
Vue Router  
mongoose  
## Font
[Seven Segment](https://fontmeme.com/jfont/seven-segment-font/)