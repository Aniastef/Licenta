**Titlul proiectului**
Art Corner - PLICAȚIE DE GESTIONARE A PORTOFOLIILOR ARTISTICE

**Autor**
Ștefania-Georgiana ISTVAN

**GitHub repository**
https://github.com/Aniastef/Licenta

**Pașii întregi de instalare în cazul în care nu există node & npm pe windows**
1. Clonăm repository-ul de GitHub;
2. Descărcăm Node.js de pe https://nodejs.org/en/download (varianta cu npm);
3. Rulăm installer-ul descărcat (cel cu .msi);
4. Deschidem PowerShell ca și administrator;
5. Rulăm comenzile "node -v" pentru a vedea versiunea de node, respectiv "npm -v" pentru versiunea de npm;
6. În cazul în care pentru npm primim o eroare în genul "File ..*npm*.. cannot be loaded because running scripts is disabled on this system.." rulăm comanda "Get-ExecutionPolicy", iar dacă primim răspunsul "Restricted" la comanda rulată, rulăm "Set-ExecutionPolicy RemoteSigned", iar mai apoi tastăm "y" ca răspuns la Execution PolicyChange. După asta, ar trebui să meargă și să putem verifica și versiunea de npm cu "npm -v";
7. Deschidem terminalul pentru proiectul clonat (eu am deschis proiectul cu Visual Studio Code, iar mai apoi m-am folosit de terminalul de acolo) și rulăm comanda "npm install" atât în folder-ul "frontend", cât și în folder-ul "backend";
8. Rulăm comanda "npm run dev" atât în folder-ul "frontend", cât și în folder-ul "backend" pentru a porni cele 2 părți ale aplicației;
10. În cazul în care avem eroare de dependency în frontend din cauza react-quill rulăm în terminal, în folder-ul "frontend", comanda "npm install react-quill";
11. Dacă deschidem http://localhost:5173/ în browser, aplicația ar trebui să fie pornită.
