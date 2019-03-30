# <img src="https://github.com/guillainbisimwa/electron-hpnk/blob/master/assets/img/hpnk2.png" width="60px" align="center" alt="hpnk"> Electron-hpnk

Ceci est une application Desktop développée avec <a href="http://electronjs.org">Electron</a>. Cette application fonctionne sur les systèmes d'exploitation Windows, MacOS et Linux.

---

## Lancer l'application

Vous aurez besoin de <a href="https://nodejs.org">Node.js</a> installé sur votre ordinateur pour pouvoir créer cette application.

```bash
$ git clone https://github.com/guillainbisimwa/electron-hpnk
$ cd electron-hpnk
$ npm install
$ npm start
```

Si vous ne souhaitez pas cloner, vous pouvez télécharger le code source (https://github.com/guillainbisimwa/electron-hpnk/archive/master.zip).

Pour faciliter le développement, vous pouvez lancer l'application en plein écran avec DevTools ouvert:

```bash
$ npm run dev
```

Pour créer un <b>Installer (.exe) pour windows </b>, vous devez d'abord créer un <b>package</b>.

```bash
$ npm run package:win 
```

Et ensuite :
```bash
$ npm run package:installer
```
