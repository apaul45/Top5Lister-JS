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
       this.edited = false;
   }

   initHandlers() {
       // SETUP THE TOOLBAR BUTTON HANDLERS
       let addButton = document.getElementById("add-list-button");
       addButton.onmousedown = (event) => {
           if (!addButton.classList.contains("disabled")){
            let newList = this.model.addNewList("Untitled", ["?","?","?","?","?"]);           
            this.model.loadList(newList.id);
            this.model.saveLists();
            document.getElementById("current-list-name").innerHTML = "Top 5 " + newList.getName();
            //Make sure the new list is visibly selected
            // document.getElementById("top5-list-" + newList.id).classList.add("selected-list-card");
           }
       }
       document.getElementById("undo-button").onmousedown = (event) => {
           this.model.undo();
       }
       document.getElementById("redo-button").onmousedown = (event) => {
            this.model.redo();
       }
       let closeButton = document.getElementById("close-button");
       closeButton.onmousedown = (event) =>{
           //If the close button isn't disabled, then call model.closeList() 
           let closeClassList = closeButton.classList;
           if (!closeClassList.contains("disabled")){
                this.model.closeList();
            }
       }
       // SETUP THE ITEM HANDLERS
       for (let i = 1; i <= 5; i++) {
           let item = document.getElementById("item-" + i);
           item.draggable = true;
           item.droppable = true;
           // AND FOR TEXT EDITING
           //Make sure to update visibility of redo and undo buttons
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
                   const inputVal = textInput.value;
                   textInput.value = "";
                   textInput.value = inputVal;
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
           //FOR DRAG & DROP: Use onddragstart to get old index, and ondragover to get new index
           // and ondrop to execute the drag and drop
           item.ondragstart = (event) => {
               //If there is no list loaded, don't allow the drag to occur
               if (!this.model.hasCurrentList()){
                   event.preventDefault();
               }
               else{
                    event.dataTransfer.effectAllowed = "move";
                    this.oldIndex = i-1;
                    console.log("on drag start worked");
               }
           }
           item.ondragover = (event) => {
               event.preventDefault();
               event.dataTransfer.effectAllowed = "move";
               this.newIndex = i-1;
               console.log("on drag over worked");
           }
           item.ondrop = (event) => {
               event.preventDefault();
               this.model.addDragItemTransaction(this.oldIndex, this.newIndex);
               console.log("on drop worked");
           }
        }
    }
   registerListSelectHandlers(id) {
       let thisList = document.getElementById("top5-list-" + id);
       // FOR SELECTING THE LIST
       thisList.onmousedown = (event) => {
           if (!this.edited){
           this.model.unselectAll();
           // GET THE SELECTED LIST
           this.model.loadList(id);
           //Set the status bar to the name of this list
           document.getElementById("current-list-name").innerHTML= "Top 5 " + this.model.currentList.getName();
           }
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
               //Make sure the selected list (if it isn't the deleted list) stays highlighted
               this.model.selectList();
           }
           cancel.onclick = (event) => {
               modal.classList.remove("is-visible");
           }
       }
       let nameSpan = document.getElementById("list-card-text-" + id);
       nameSpan.ondblclick = (event) => {
           this.edited =true;
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
                       document.getElementById("current-list-name").innerHTML="Top 5 " + textInput.value;
                       this.edited = false;
                   }
               }
               textInput.onblur = (event) => {
                   if (!enterPressed){
                       //If another list has been loaded, make sure not to change the name of that list too
                       if (this.model.currentList.getId() != id){
                            nameSpan.innerHTML = textInput.value;
                            this.model.getList(this.model.getListIndex(id)).setName(textInput.value);
                       }
                       //Set the displayed and actual name of the list to the inputted text
                       nameSpan.innerHTML = textInput.value;
                       this.model.currentList.setName(textInput.value);
                       //Sort and save the list after changing the name
                       this.model.sortLists();
                       this.model.saveLists();
                       //Make sure to update the name shown in the status bar once the user enters a new name
                       document.getElementById("current-list-name").innerHTML="Top 5 " + textInput.value;
                       this.edited = false;
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
