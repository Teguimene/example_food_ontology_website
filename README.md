**Website representing an ontology based on eating habits in RWANDA**

1. First unzip the folder containing the Jena fuseki server;
2. Once the folder is unzipped, open it and right-click on "fuseki-server" and choose the option "Run as a program or launch as a program in French";
3. Our server is already launched. To access it, open your browser and type in the search bar "localhost:3030", you should see the Jena interface;
4. On the horizontal menu at the top, click on "manage". Then on the "new dataset" button at the bottom of the list. In this interface, choose the option "Persistent (TDB2) - dataset will persist across Fuseki" restarted to allow the saving of our data in a persistent way and as the name of the dataset put "food" and click on "create dataset";
5. Once the dataset is created, all that remains is to populate it. In the list displayed after creation, choose the line corresponding to your dataset and click on "add data" then on "select file". Navigate to my folder and choose the file "foodOntology.ttl" and finally click on "upload all";

6. All that remains is to use the application. Open the foodOntology.html file on your browser and consume the application.

***NB:*** - If you want to add a dish, use the foodDatas.txt file to have some examples of dishes to use because they have images on github; <br /> - If you want to execute a query in the endpoint space, use the query provided in the foodDadas file because the return of the execution corresponds to this query.

***Happy use!***
