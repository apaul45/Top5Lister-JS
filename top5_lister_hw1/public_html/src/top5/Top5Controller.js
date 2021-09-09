/* This file provides responses for all user interface interactions.
*
* @author McKilla Gorilla
* @author ?
*/
export default class Top5Controller {
   constructor() {
 
   }
 
   setModel(initModel) {
       this.model = initModel;
       this.initHandlers();
   }
 
   initHandlers() {
       // SETUP THE TOOLBAR BUTTON HANDLERS
       document.getElementById("add-list-button").onmousedown = (event) => {
           let newList = this.model.addNewList("Untitled", ["?","?","?","?","?"]);           
           this.model.loadList(newList.id);
           this.model.saveLists();
       }
       document.getElementById("undo-button").onmousedown = (event) => {
           this.model.undo();
       }
       // SETUP THE ITEM HANDLERS
       for (let i = 1; i <= 5; i++) {
           let item = document.getElementById("item-" + i);
 
           // AND FOR TEXT EDITING
           item.ondblclick = (ev) => {
               if (this.model.hasCurrentList()) {
                   // CLEAR THE TEXT
                   item.innerHTML = "";
 
                   // ADD A TEXT FIELD
                   let textInput = document.createElement("input");
                   textInput.setAttribute("type", "text");
                   textInput.setAttribute("id", "item-text-input-" + i);
                   textInput.setAttribute("value", this.model.currentList.getItemAt(i-1));
 
                   item.appendChild(textInput);
 
                   textInput.ondblclick = (event) => {
                       this.ignoreParentClick(event);
                   }
                   textInput.onkeydown = (event) => {
                       if (event.key === 'Enter') {
                           this.model.addChangeItemTransaction(i-1, event.target.value);
                       }
                   }
                   textInput.onblur = (event) => {
                       this.model.restoreList();
                   }
               }
           }
       }
   }
 
   registerListSelectHandlers(id) {
       let thisList = document.getElementById("top5-list-" + id);
       // FOR SELECTING THE LIST
       thisList.onmousedown = (event) => {
           this.model.unselectAll();
           // GET THE SELECTED LIST
           this.model.loadList(id);
           //Set the status bar to the name of this list
           document.getElementById("current-list-name").innerHTML= "Top 5 " + this.model.currentList.getName();
       }
       // //For highlighting
       // thisList.onmouseenter = (event) =>{
       //     thisList.style.backgroundColor = "#111111";
       // }
       // thisList.onmouseleave = (event) => {
       //     thisList.style.backgroundColor = "#e1e4cb";
       // }
       // FOR DELETING THE LIST
       document.getElementById("delete-list-" + id).onmousedown = (event) => {
           this.ignoreParentClick(event);
           // VERIFY THAT THE USER REALLY WANTS TO DELETE THE LIST
           let modal = document.getElementById("delete-modal");
           this.listToDeleteIndex = id;
           let listName = this.model.getList(this.model.getListIndex(id)).getName();
           let deleteSpan = document.getElementById("delete-list-span");
           deleteSpan.innerHTML = "";
           deleteSpan.appendChild(document.createTextNode(listName));
           modal.classList.add("is-visible");
           //Get the confirm and cancel buttons, and add click event handlers
           let confirm = document.getElementById("dialog-confirm-button");
           let cancel = document.getElementById("dialog-cancel-button");
           confirm.onclick = (event) => {
               this.model.deleteList(id);
               this.model.sortLists();
               this.model.saveLists();
               modal.classList.remove("is-visible");
           }
           cancel.onclick = (event) => {
               modal.classList.remove("is-visible");
           }
       }
       let nameSpan = document.getElementById("list-card-text-" + id);
       nameSpan.ondblclick = (event) => {
           if (this.model.hasCurrentList()){
               // CLEAR THE TEXT
               thisList.innerHTML = "";
               // ADD A TEXT FIELD
               let textInput = document.createElement("input");
               textInput.setAttribute("type", "text");
               textInput.setAttribute("id", "listname-text-input-" + id);
               textInput.setAttribute("value", this.model.currentList.getName());
               thisList.appendChild(textInput);
               textInput.ondblclick = (event) => {
                   this.ignoreParentClick(event);
               }
               let enterPressed = false;
               textInput.onkeydown = (event) => {
                   if (event.key === "Enter") {
                       //Set the displayed and actual name of the list to the inputted text
                       nameSpan.innerHTML = textInput.value;
                       this.model.currentList.setName(textInput.value);
                       //Sort and save the list after changing the name
                       this.model.sortLists();
                       this.model.saveLists();
                       enterPressed = true;
                   }
               }
               textInput.onblur = (event) => {
                   if (!enterPressed){
                       //Set the displayed and actual name of the list to the inputted text
                       nameSpan.innerHTML = textInput.value;
                       this.model.currentList.setName(textInput.value);
                       //Sort and save the list after changing the name
                       this.model.sortLists();
                       this.model.saveLists();
                   }
               }
           }
       }
   }
 
   ignoreParentClick(event) {
       event.cancelBubble = true;
       if (event.stopPropagation) event.stopPropagation();
   }
 
}
