
# Art Corner - APLICAȚIE DE GESTIONARE A PORTOFOLIILOR ARTISTICE

## Autor: Ștefania-Georgiana ISTVAN

#### [**GitHub repository link**](https://github.com/Aniastef/Licenta)

### **Pașii de instalare și compilare**
1. Clonăm repository-ul de GitHub;
2. Descărcăm [Node.js](https://nodejs.org/en/download) (varianta cu npm);
3. Rulăm installer-ul descărcat (cel cu .msi);
4. Deschidem PowerShell ca și administrator;
5. Rulăm comenzile:
```bash
node -v # pentru a vedea versiunea de node instalată
npm -v # pentru a vedea versiunea de npm instalată
```
În cazul în care pentru npm primim o eroare în genul **File ..npm.. cannot be loaded because running scripts is disabled on this system..** rulăm comanda:
```bash
Get-ExecutionPolicy
``` 
iar dacă primim răspunsul *Restricted* la comanda rulată, rulăm
```bash
Set-ExecutionPolicy RemoteSigned
``` 
 iar mai apoi **tastăm "y" ca răspuns la Execution PolicyChange**. După asta, ar trebui să meargă și să putem verifica și versiunea de npm cu **npm -v**;

6. Deschidem terminalul pentru proiectul clonat (eu am deschis proiectul cu Visual Studio Code, iar mai apoi m-am folosit de terminalul de acolo) și rulăm comanda următoare atât în folder-ul "frontend", cât și în folder-ul "backend":

```bash
npm install
``` 
7. Un fișier care trebuie creat de fiecare utilizator pentru a rula aplicația este .env, cel care conține variabilele de mediu. Arată în următorul fel:

```bash
PORT=
MONGO_URI=
JWT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
STRIPE_SECRET_KEY=
NODE_ENV=
ADMIN_SECRET=
``` 
8. Rulăm și următoarea comandă atât în folder-ul "frontend", cât și în folder-ul "backend", pentru a porni cele 2 părți ale aplicației:
```bash
npm run dev
``` 
9. În cazul în care avem eroare de dependency în frontend din cauza react-quill rulăm în terminal, în folder-ul "frontend", comanda:
```bash
npm install react-quill
``` 
10. Acum, dacă deschidem http://localhost:5173/ în browser, aplicația ar trebui să fie pornită și să funcționeze conform.
