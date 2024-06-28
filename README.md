**Site web représentant une ontology basée sur les habitudes alimentaire au RWANDA**

1.  Tout d'abord décompressez le dossier contenant le server Jena fuseki ;
2.  Une fois le dossier décompressé, ouvez-le et faite un clique droit sur "fuseki-server" et choisissez l'option "Run as a program ou lancer comme un programme en français" ;
3. Notre server est déjà lancé. Pour y accéder, ouvrez votre navigateur et tapez sur la barre de recherche "localhost:3030", vous devrez appercevoir l'interface de Jena ;
4. Sur le menu horizontal en haut, cliquez sur "manage". Puis sur le bouton  "new  dataset" en bas sur la liste. Dans cette interface, choisissez l'option "Persistent (TDB2) – dataset will persist across Fuseki" restartsé pour permettre la sauvegarde de nos données de manière persistente et comme nom du dataset mettez "food" et cliquez sur "create dataset" ;
5. Une fois le dataset crée, il ne reste plus qu'a le populer. Dans la liste affiché après la création, choisissez la ligne correspondante à votre dataset et cliquez sur "add data" puis sur "select file". Naviguez jusqu'à mon dossier et choisissez le fichier "foodOntology.ttl" et enfin cliquez sur "upload all" ;
6. Il ne reste plus qu'a utiliser l'application. Ouvrez le fichier foodOntology.html sur votre navigateur et consommez l'application.

***NB : *** - Si vous voulez ajouter un plat, utilisez le fichier foodDatas.txt pour avoir quelques exemples de plat à utiliser car ceux-ci ont des images sur github ; <br /> - Si vous voulez exécuter une requête dans l'espace de endpoint, utilisez la requête fournit dans le fichier foodDadas car le retour de l'exécution correspond à cette requête. 


***Bonne utilisation !***