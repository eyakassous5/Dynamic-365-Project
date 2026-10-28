# Immo Tunis : Optimisation du CRM (Dynamics 365 + Power BI)

Projet réalisé dans le cadre du module **CRM : Concept & Pratique** (ESPRIT, session principale 26-27).

**Auteures :** Eya Kassous et Molka Gharbi

Immo Tunis est une agence immobilière spécialisée dans la vente et la location de biens résidentiels et commerciaux. Ce projet améliore son CRM **Dynamics 365 Sales** afin de mieux gérer les agents, les biens, les visites et les prospects, puis de suivre la performance commerciale dans un tableau de bord **Power BI**.

---

## Sommaire

1. [Contenu du dépôt](#contenu-du-dépôt)
2. [Partie 1 : Agents, Biens et Visites](#partie-1--agents-biens-et-visites)
3. [Partie 2 : BPF Prospects et Power BI](#partie-2--bpf-prospects-et-power-bi)
4. [Installation](#installation)
5. [Captures d'écran](#captures-décran)
6. [Technologies](#technologies)

---

## Contenu du dépôt

| Fichier | Description |
|---|---|
| `Sol_MolkaGharbi_EyaKassous_1_0_0_1.zip` | Solution **Partie 1** : tables Agent, Bien, Visite, workflows, script JavaScript |
| `personnalisation_immo_EyaKassous_MolkaGharbi_1_0_0_1.zip` | Solution **Partie 2** : BPF personnalisé, champs Prospect / Opportunité, flux Power Automate |
| `bien_form.js` | Script JavaScript du formulaire Bien (verrouillage des champs) |
| `immo_tunisie_crm.pbix` | Tableau de bord Power BI |
| `Etude_de_cas_CRM_Immo_BI.pdf` | Énoncé du cas d'étude |

---

## Partie 1 : Agents, Biens et Visites

Solution : `Sol_MolkaGharbi_EyaKassous` (éditeur : `eyaPublisher`, préfixe `eya_`).

### Tables

| Table | Champs principaux |
|---|---|
| **Agent** (`eya_agent`) | Nom de l'agent, numéro de téléphone, email, zone géographique, nombre de biens |
| **Bien** (`eya_bien`) | Référence, type de bien (Appartement, Villa, Terrain, Local commercial), adresse, surface (m²), prix demandé, agent responsable (recherche vers Agent), statut du bien (Disponible, Sous offre, Vendu, Retiré) |
| **Visite** (`eya_visite`) | Nom du visiteur, date de visite, date de compte-rendu, bien lié (recherche vers Bien), statut (Planifiée, Effectuée, Annulée), commentaire |

### Relations

- Un **Agent** a plusieurs **Biens** (recherche *Agent responsable*).
- Un **Bien** a plusieurs **Visites** (recherche *Bien lié*).

### Formulaires

- Formulaire personnalisé pour chaque table.
- Formulaire **Agent** : sous-grille des biens.
- Formulaire **Bien** : onglets « Caractéristiques » et « Visites » (sous-grille des visites).

### Workflows

| Workflow | Déclencheur | Actions |
|---|---|---|
| **Comptage des biens d'un agent** | Création d'un bien | Incrémente le champ *Nombre de biens* de l'agent responsable |
| **Relance après visite** | Statut de la visite passe à *Effectuée* | Crée la tâche « Relancer le visiteur » (échéance J+2, assignée à l'agent responsable) et renseigne la *Date de compte-rendu* avec la date du jour |

### Script JavaScript (`bien_form.js`)

Le script `ImmoTunis.Bien` se déclenche **au chargement du formulaire** et **au changement du champ Statut du bien**.

- Si le bien est **Vendu** ou **Retiré** : les champs *Prix demandé* et *Agent responsable* sont désactivés.
- Une notification de formulaire s'affiche : « Ce bien n'est plus disponible, modification impossible ».
- Sinon, les champs sont réactivés et la notification disparaît.

Enregistrement des événements sur le formulaire Bien :

| Événement | Fonction |
|---|---|
| OnLoad du formulaire | `ImmoTunis.Bien.onLoad` (cocher « Passer le contexte d'exécution ») |
| OnChange de *Statut du bien* | `ImmoTunis.Bien.onChangeStatut` (cocher « Passer le contexte d'exécution ») |

> Les valeurs des choix de statut dans le script (`555550000` à `555550003`) doivent correspondre à celles de votre environnement.

### Vues filtrées

- **Agents** : agents ayant au moins une visite planifiée dans les 7 prochains jours.
- **Biens** : biens *Disponible* créés depuis plus de 90 jours.
- **Visites** : visites *Effectuées* au cours du dernier mois.

---

## Partie 2 : BPF Prospects et Power BI

Solution : `personnalisation_immo_EyaKassous_MolkaGharbi` (tables Prospect, Opportunité, Bien, Utilisateur, Agent, Visite et le BPF).

### Business Process Flow : « BPF Immo Tunis - Prospects »

| Étape | Champs | Table |
|---|---|---|
| 1. Capture | Nom, email, date de création, propriétaire | Prospect (standard) |
| 2. Qualification | Score de qualification (0 à 100), Source du prospect, Type de projet, Budget estimé | Prospect (champs personnalisés) |
| 3. Visite et Proposition | Bien présenté, Nombre de visites effectuées | Opportunité (champs personnalisés) |
| 4. Conclusion | Statut, montant de la transaction, date de conclusion | Opportunité (standard) |

### Automatisation

Flux Power Automate **« Qualification selon score »**, déclenché à la modification du *Score de qualification* d'un prospect :

- Score **≥ 70** : le prospect est qualifié, une opportunité est créée et le BPF passe à l'étape « Visite et Proposition ».
- Score **< 30** : le prospect est disqualifié et l'agent propriétaire est notifié par email.

### Tableau de bord Power BI (`immo_tunisie_crm.pbix`)

**Source de données :** Dynamics 365 (Dataverse), tables `lead`, `opportunity`, `systemuser`, `eya_bien`.

**Mesures DAX**

| Mesure | Définition |
|---|---|
| Nb Prospects | Nombre de prospects |
| Transactions Gagnées | Opportunités au statut Gagnée |
| Taux de Conversion | Transactions gagnées / prospects |
| Chiffre d'Affaires | Somme du revenu réel des opportunités gagnées |
| Valeur Moyenne | Chiffre d'affaires / transactions gagnées |
| Délai Moyen (jours) | Écart moyen entre la création du prospect et la date de conclusion |

**Visuels**

- Cartes : taux de conversion, valeur moyenne, délai moyen de conclusion.
- Barres : taux de conversion par source, sur différentes périodes.
- Colonnes : chiffre d'affaires par agent.
- Barres : prospects par agent avec leur taux de conversion.
- Courbes : évolution mensuelle des transactions gagnées.
- Matrice : taux de conversion et valeur moyenne par source, type de projet et agent.
- Segments : période, source, type de projet, agent.

**Actualisation :** connexion directe à Dataverse (DirectQuery ou actualisation planifiée dans Power BI Service).

---

## Installation

### Solutions Dynamics 365

1. Ouvrir [make.powerapps.com](https://make.powerapps.com) et choisir le bon environnement.
2. Aller dans **Solutions**, puis **Importer la solution**.
3. Importer d'abord `Sol_MolkaGharbi_EyaKassous_1_0_0_1.zip` (Partie 1).
4. Importer ensuite `personnalisation_immo_EyaKassous_MolkaGharbi_1_0_0_1.zip` (Partie 2).
5. Configurer les **références de connexion** demandées (Dataverse, Office 365) pour les flux.
6. Activer les workflows, le flux Power Automate et le BPF, puis **Publier toutes les personnalisations**.

### Tableau de bord Power BI

1. Ouvrir `immo_tunisie_crm.pbix` dans **Power BI Desktop**.
2. **Transformer les données**, **Paramètres de la source de données**, puis remplacer l'adresse de l'environnement par la vôtre (`orgXXXXXXXX.crm4.dynamics.com`).
3. Se connecter avec un compte ayant accès à l'environnement, puis **Actualiser**.

---

## Captures d'écran

<!-- Ajoutez vos images dans un dossier /docs et décommentez : -->
<!--
![Tables](docs/tables.png)
![Formulaire Bien](docs/formulaire-bien.png)
![BPF](docs/bpf.png)
![Tableau de bord](docs/dashboard.png)
-->

---

## Technologies

- Microsoft Dynamics 365 Sales / Dataverse
- Power Apps (solutions, tables, formulaires, vues)
- Workflows et Power Automate
- JavaScript (API client Dynamics 365)
- Power BI Desktop et DAX

---

*Projet pédagogique, ESPRIT : module CRM : Concept & Pratique.*
