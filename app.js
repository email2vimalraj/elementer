;(function() {
  "use strict"

  // Comment the following line for DEV
  // var manifest = chrome.runtime.getManifest()
  var manifest = {
    version: "1.2.0"
  }

  // Un-comment the following line for DEV
  // var manifest = {version: "2.0.0"};

  var brandName = document.getElementById("brandName")
  var pageObjectListBtn = document.getElementById("pageObjectListBtn")
  var addPageObjectBtn = document.getElementById("addPageObjectBtn")
  var updatePageObjectBtn = document.getElementById("updatePageObjectBtn")
  var addElementBtn = document.getElementById("addElementBtn")
  var showPageObjectListBtn = document.getElementById("showPageObjectListBtn")
  var importFromJsonBtn = document.getElementById("importFromJsonBtn")
  var importJsonBtn = document.getElementById("importJsonBtn")

  // Sections
  var pageObjectListSection = document.getElementById("pageObjectListSection")
  var addPageObjectSection = document.getElementById("addPageObjectSection")
  var addElementSection = document.getElementById("addElementSection")
  var elementsListSection = document.getElementById("elementsListSection")
  var localeListSection = document.getElementById("localeListSection")
  var importJsonSection = document.getElementById("importJsonSection")

  // Alerts
  var elementSuccessAlert = document.getElementById("element-success-alert")
  var elementDangerAlert = document.getElementById("element-danger-alert")

  var sections = [
    pageObjectListSection,
    addPageObjectSection,
    addElementSection,
    elementsListSection,
    localeListSection,
    importJsonSection
  ]

  var navButtons = [showPageObjectListBtn, pageObjectListBtn, importJsonBtn]
  var db = new PouchDB("elementer-db")

  db.changes({
    since: "now",
    live: true
  }).on("change", showPageObjects)

  // Show the required section and hide the others
  function showSection(section) {
    for (var i = 0; i < sections.length; i++) {
      if (sections[i] === section) {
        sections[i].style.display = ""
      } else {
        sections[i].style.display = "none"
      }
    }
  }

  // Get all the page object documents
  function showPageObjects() {
    db.allDocs({ include_docs: true, descending: true }, function(err, doc) {
      redrawPageObjectsUI(doc.rows)
    })
  }

  // Add the page object to the database
  function addPageObject(name, defaultLocale) {
    var pageObject = {
      _id: new Date().toISOString(),
      name: name,
      defaultLocale: defaultLocale,
      elementerVersion: manifest.version,
      elements: []
    }
    console.log(pageObject)

    db.put(pageObject, function callback(err, result) {
      if (!err) {
        console.log("Successfully added a page object!")

        var elementPageObjectId = document.getElementById("elementPageObjectId")
        elementPageObjectId.value = result.id
      } else {
        console.log(err)
      }
    })
  }

  function addPageObjectFormDisplay() {
    showSection(addPageObjectSection)
    setActiveNav(pageObjectListBtn)

    addPageObjectBtn.style.display = ""
    updatePageObjectBtn.style.display = "none"

    document.getElementById("pageObjectName").value = ""
  }

  function showAddPageObjectFormListener(event) {
    event.preventDefault()
    addPageObjectFormDisplay()
  }

  function hasWhiteSpace(s) {
    return /\s/g.test(s)
  }

  function isFirstCharSmall(s) {
    return /^[a-z]/g.test(s)
  }

  function isEmpty(s) {
    return s === ""
  }

  function showAddElementFormListener(event) {
    event.preventDefault()
    console.log(event)
    var pageObjectName = document.getElementById("pageObjectName")
    var defaultLocaleEle = document.getElementById("defaultLocale")
    var pageObjectDiv = document.getElementById("pageObjectDiv")
    var defaultLocaleDiv = document.getElementById("defaultLocaleDiv")

    // Check for errors
    if (hasWhiteSpace(pageObjectName.value)) {
      pageObjectDiv.className = pageObjectDiv.className + " has-error"
      return
    } else if (isFirstCharSmall(pageObjectName.value)) {
      pageObjectDiv.className = pageObjectDiv.className + " has-error"
      return
    } else if (isEmpty(pageObjectName.value)) {
      pageObjectDiv.className = pageObjectDiv.className + " has-error"
      return
    } else {
      pageObjectDiv.className = "form-group"
    }

    if (defaultLocaleEle[defaultLocaleEle.selectedIndex].value === "") {
      defaultLocaleDiv.className = defaultLocaleDiv.className + " has-error"
      return
    } else {
      defaultLocaleDiv.className = "form-group"
    }

    addPageObject(
      pageObjectName.value,
      defaultLocaleEle[defaultLocaleEle.selectedIndex].value
    )

    var elementPageObjectName = document.getElementById("elementPageObjectName")
    elementPageObjectName.value = pageObjectName.value
    pageObjectName.value = ""

    var localeSelectElement = document.getElementById("locale")
    for (var i, j = 0; (i = localeSelectElement.options[j]); j++) {
      if (i.value === defaultLocaleEle[defaultLocaleEle.selectedIndex].value) {
        localeSelectElement.selectedIndex = j
        break
      }
    }

    showSection(addElementSection)
    setActiveNav(pageObjectListBtn)
    document.getElementById("updateElementBtn").style.display = "none"
  }

  function setActiveNav(buttonObject) {
    for (var i = 0; i < navButtons.length; i++) {
      if (navButtons[i] === buttonObject) {
        navButtons[i].className = "active"
      } else {
        navButtons[i].className = ""
      }
    }
  }

  function addElementListener(event) {
    event.preventDefault()
    console.log("Adding element")
    var pageObjectId = document.getElementById("elementPageObjectId")
    var pageElementName = document.getElementById("pageElementName")
    var isListElement = document.getElementById("isList")
    var elementType = document.getElementById("elementType")
    var pageElementVariableDiv = document.getElementById(
      "pageElementVariableDiv"
    )

    if (isEmpty(pageElementName.value)) {
      pageElementVariableDiv.className =
        pageElementVariableDiv.className + " has-error"
      return
    } else if (hasWhiteSpace(pageElementName.value)) {
      pageElementVariableDiv.className =
        pageElementVariableDiv.className + " has-error"
      return
    } else if (!isFirstCharSmall(pageElementName.value)) {
      pageElementVariableDiv.className =
        pageElementVariableDiv.className + " has-error"
      return
    }

    var selectedElement = document.querySelector(
      'input[name = "selectedElement"]:checked'
    )

    if (isEmpty(document.getElementById(selectedElement.value).value)) {
      document.getElementById("attributeEmptyDiv").style.display = ""
      return
    } else {
      document.getElementById("attributeEmptyDiv").style.display = "none"
    }

    // var isList = document.getElementById("isList");
    var locale = document.getElementById("locale")
    var waitTimeInSeconds = document.getElementById("waitTimeInSeconds")
    var waitAction = document.getElementById("waitAction")
    var tagName = document.getElementById("tagName")
    var tagId = document.getElementById("tagId")
    var name = document.getElementById("name")
    var xpath = document.getElementById("xpath")
    var cssPath = document.getElementById("cssPath")
    var className = document.getElementById("className")

    db.get(pageObjectId.value, function(err, doc) {
      if (!err) {
        let selectedAttr = ""
        switch (selectedElement.value) {
          case "xpath":
            selectedAttr = `xpath=${xpath.value}`
            break
          case "cssPath":
            selectedAttr = `css=${cssPath.value}`
            break
          case "className":
            selectedAttr = `class=${className.value}`
            break
          case "tagName":
            selectedAttr = `tagName=${tagName.value}`
            break
          case "tagId":
            selectedAttr = `${tagId.value}`
            break
          case "name":
            selectedAttr = `${name.value}`
            break
        }

        var updateDoc = {
          name: pageElementName.value,
          list: isListElement.checked,
          type: elementType.value === "" ? "generic" : elementType.value,
          locale: [
            {
              name: locale[locale.selectedIndex].value,
              locator: selectedAttr
            }
          ]
        }

        if (waitAction[waitAction.selectedIndex].value !== "") {
          updateDoc.wait = {
            until: waitAction[waitAction.selectedIndex].value,
            for: +waitTimeInSeconds.value
          }
        }

        console.log(updateDoc)

        doc.elements.push(updateDoc)

        db.put(
          {
            _id: doc._id,
            _rev: doc._rev,
            name: doc.name,
            defaultLocale: doc.defaultLocale,
            elements: doc.elements,
            elementerVersion: doc.elementerVersion
          },
          function(err, response) {
            if (err) {
              console.log(err)
              elementDangerAlert.style.display = ""

              $("#element-danger-alert").alert()
            } else {
              pageElementName.value = ""
              isListElement.checked = false
              elementType.value = ""
              waitTimeInSeconds.value = 0
              waitAction.selectedIndex = 0
              // locale.selectedIndex = 0;
              tagName.value = ""
              tagId.value = ""
              name.value = ""
              xpath.value = ""
              cssPath.value = ""
              className.value = ""
              document.getElementById("selectedElement_tagId").checked = true
              elementSuccessAlert.style.display = ""

              $("#element-success-alert").alert()
            }
          }
        )
      } else {
        console.log(err)
      }
    })
    console.log("Element added")
  }

  function showPageObjectListListener(event) {
    event.preventDefault()
    showSection(pageObjectListSection)
    console.log("show page object")
    showPageObjectListBtn.className = "active"
    pageObjectListBtn.className = ""
    importJsonBtn.className = ""
  }

  function filePathListener(event) {
    var file = event.target.files[0]
    console.log(file)
    var textType = /json.*/

    if (file.type.match(textType)) {
      var reader = new FileReader()

      reader.onload = function(e) {
        document.getElementById("pageObjectJson").value = reader.result
      }

      reader.readAsText(file)
    } else {
      document.getElementById("pageObjectJson").value = "File not supported!!!"
    }
  }

  function addEventListeners() {
    console.log("adding event listeners")
    brandName.addEventListener("click", showPageObjectListListener, false)
    showPageObjectListBtn.addEventListener(
      "click",
      showPageObjectListListener,
      false
    )
    pageObjectListBtn.addEventListener(
      "click",
      showAddPageObjectFormListener,
      false
    )
    importJsonBtn.addEventListener(
      "click",
      showImportJsonSectionListener,
      false
    )
    addPageObjectBtn.addEventListener(
      "click",
      showAddElementFormListener,
      false
    )
    addElementBtn.addEventListener("click", addElementListener, false)
    importFromJsonBtn.addEventListener("click", importFromJsonListener, false)

    document
      .getElementById("filePath")
      .addEventListener("change", filePathListener, false)
    console.log("added event listeners")
  }

  function importFromJsonListener(event) {
    event.preventDefault()
    importJson(JSON.parse(document.getElementById("pageObjectJson").value))
  }

  function importJson(jsonDocument) {
    jsonDocument._id = new Date().toISOString()

    db.put(jsonDocument, function callback(err, result) {
      if (!err) {
        console.log("Successfully imported a page object!")

        showSection(pageObjectListSection)
      } else {
        console.log(err)
      }
    })
  }

  function elementsListButtonPressed(pageObject) {
    showSection(elementsListSection)
    setActiveNav(pageObjectListBtn)
    redrawElementsListUI(pageObject)
  }

  function editPageObjectButtonPressed(pageObject) {
    addPageObjectFormDisplay()
    updatePageObjectBtn.style.display = ""
    addPageObjectBtn.style.display = "none"

    setActiveNav(pageObjectListBtn)

    document.getElementById("pageObjectName").value = pageObject.name
    console.log(pageObject.defaultLocale)
    var defaultLocaleSelectElement = document.getElementById("defaultLocale")
    for (var i, j = 0; (i = defaultLocaleSelectElement.options[j]); j++) {
      if (i.value === pageObject.defaultLocale) {
        defaultLocaleSelectElement.selectedIndex = j
        break
      }
    }

    updatePageObjectBtn.addEventListener(
      "click",
      updatePageObjectListener.bind(this, pageObject)
    )
  }

  function updatePageObjectListener(pageObject) {
    var pageObjectName = document.getElementById("pageObjectName")
    var defaultLocaleEle = document.getElementById("defaultLocale")
    var pageObjectDiv = document.getElementById("pageObjectDiv")
    var defaultLocaleDiv = document.getElementById("defaultLocaleDiv")

    // Check for errors
    if (hasWhiteSpace(pageObjectName.value)) {
      pageObjectDiv.className = pageObjectDiv.className + " has-error"
      return
    } else if (isFirstCharSmall(pageObjectName.value)) {
      pageObjectDiv.className = pageObjectDiv.className + " has-error"
      return
    } else if (isEmpty(pageObjectName.value)) {
      pageObjectDiv.className = pageObjectDiv.className + " has-error"
      return
    } else {
      pageObjectDiv.className = "form-group"
    }

    if (defaultLocaleEle[defaultLocaleEle.selectedIndex].value === "") {
      defaultLocaleDiv.className = defaultLocaleDiv.className + " has-error"
      return
    } else {
      defaultLocaleDiv.className = "form-group"
    }

    db.get(pageObject._id, function(err, doc) {
      if (!err) {
        doc.name = pageObjectName.value
        doc.defaultLocale = defaultLocale[defaultLocale.selectedIndex].value

        db.put(
          {
            _id: doc._id,
            _rev: doc._rev,
            name: doc.name,
            defaultLocale: doc.defaultLocale,
            elements: doc.elements,
            elementerVersion: doc.elementerVersion
          },
          function(err, response) {
            if (!err) {
              console.log("Page Object updated")
              showSection(pageObjectListSection)
            } else {
              console.log(err)
            }
          }
        )
      } else {
        console.log(err)
      }
    })
  }

  function addElementButtonPressed(pageObject) {
    showSection(addElementSection)

    document.getElementById("elementPageObjectId").value = pageObject._id
    document.getElementById("elementPageObjectName").value = pageObject.name
    document.getElementById("pageElementName").value = ""
    document.getElementById("isList").checked = false
    document.getElementById("elementType").value = ""
    var locale = document.getElementById("locale")
    for (var i, j = 0; (i = locale.options[j]); j++) {
      if (i.value === pageObject.defaultLocale) {
        locale.selectedIndex = j
        break
      }
    }
    document.getElementById("waitTimeInSeconds").value = 0
    document.getElementById("waitAction").selectedIndex = 0
    document.getElementById("tagName").value = ""
    document.getElementById("tagId").value = ""
    document.getElementById("name").value = ""
    document.getElementById("xpath").value = ""
    document.getElementById("cssPath").value = ""
    document.getElementById("className").value = ""

    document.getElementById("updateElementBtn").style.display = "none"

    setActiveNav(pageObjectListBtn)
    addElementBtn.style.display = ""
  }

  function deletePageObjectBtnPressed(pageObject) {
    db.get(pageObject._id, function(err, doc) {
      if (!err) {
        db.remove(doc, function(err, response) {
          if (!err) {
            console.log("Page Object removed!!!")
          } else {
            console.log(err)
          }
        })
      } else {
        console.log(err)
      }
    })
  }

  function redrawElementsListUI(pageObject) {
    var ul = document.getElementById("elementsList")
    ul.innerHTML = ""

    var idX = 0
    pageObject.elements.forEach(function(element) {
      ul.appendChild(createElementListItem(pageObject, element, idX))
      idX++
    })
  }

  // Prepares the locale list section
  function redrawLocaleListUI(pageObject, elementName) {
    var ul = document.getElementById("localeList")
    ul.innerHTML = ""

    var elementId = 0
    for (var i = 0; i < pageObject.elements.length; i++) {
      if (pageObject.elements[i].name === elementName) {
        elementId = i
        break
      }
    }

    var localeId = 0
    for (var i = 0; i < pageObject.elements[elementId].locale.length; i++) {
      ul.appendChild(createLocaleListItem(pageObject, elementId, localeId))
      localeId++
    }
  }

  function updateElementBtnPressed(pageObject, elementId, localeId) {
    var pageElementName = document.getElementById("pageElementName")
    var isListElement = document.getElementById("isList")
    var elementType = document.getElementById("elementType")
    var pageElementVariableDiv = document.getElementById(
      "pageElementVariableDiv"
    )

    if (isEmpty(pageElementName.value)) {
      pageElementVariableDiv.className =
        pageElementVariableDiv.className + " has-error"
      return
    } else if (hasWhiteSpace(pageElementName.value)) {
      pageElementVariableDiv.className =
        pageElementVariableDiv.className + " has-error"
      return
    } else if (!isFirstCharSmall(pageElementName.value)) {
      pageElementVariableDiv.className =
        pageElementVariableDiv.className + " has-error"
      return
    }

    var selectedElement = document.querySelector(
      'input[name = "selectedElement"]:checked'
    )

    if (isEmpty(document.getElementById(selectedElement.value).value)) {
      document.getElementById("attributeEmptyDiv").style.display = ""
      return
    } else {
      document.getElementById("attributeEmptyDiv").style.display = "none"
    }

    var locale = document.getElementById("locale")
    var waitTimeInSeconds = document.getElementById("waitTimeInSeconds")
    var waitAction = document.getElementById("waitAction")
    var tagName = document.getElementById("tagName")
    var tagId = document.getElementById("tagId")
    var name = document.getElementById("name")
    var xpath = document.getElementById("xpath")
    var cssPath = document.getElementById("cssPath")
    var className = document.getElementById("className")

    db.get(pageObject._id, function(err, doc) {
      if (!err) {
        doc.elements[elementId].name = pageElementName.value
        doc.elements[elementId].list = isListElement.checked
        doc.elements[elementId].type =
          elementType.value === "" ? "generic" : elementType.value
        if (waitAction[waitAction.selectedIndex].value !== "") {
          doc.elements[elementId].wait.for = +waitTimeInSeconds.value
          doc.elements[elementId].wait.until =
            waitAction[waitAction.selectedIndex].value
        }

        doc.elements[elementId].locale[localeId].name =
          locale[locale.selectedIndex].value

        let selectedAttr = ""
        switch (selectedElement.value) {
          case "xpath":
            doc.elements[elementId].locale[
              localeId
            ].locator = `xpath=${xpath.value}`
            break
          case "cssPath":
            doc.elements[elementId].locale[
              localeId
            ].locator = `css=${cssPath.value}`
            break
          case "className":
            doc.elements[elementId].locale[
              localeId
            ].locator = `class=${className.value}`
            break
          case "tagName":
            doc.elements[elementId].locale[
              localeId
            ].locator = `tagName=${tagName.value}`
            break
          case "tagId":
            doc.elements[elementId].locale[localeId].locator = `${tagId.value}`
            break
          case "name":
            doc.elements[elementId].locale[localeId].locator = `${name.value}`
            break
        }

        db.put(
          {
            _id: doc._id,
            _rev: doc._rev,
            name: doc.name,
            defaultLocale: doc.defaultLocale,
            elements: doc.elements,
            elementerVersion: doc.elementerVersion
          },
          function(err, response) {
            if (err) {
              console.log(err)
              // elementSuccessAlert.style.display = 'none';
              elementDangerAlert.style.display = ""

              $("#element-danger-alert").alert()
            } else {
              // elementDangerAlert.style.display = 'none';
              elementSuccessAlert.style.display = ""
              $("#element-success-alert").alert()
              showSection(pageObjectListSection)
            }
          }
        )
      } else {
        console.log(err)
      }
    })
  }

  function addLocaleElementButtonPressed(pageObject, element, idX) {
    showSection(addElementSection)

    document.getElementById("elementPageObjectId").value = pageObject._id
    document.getElementById("elementPageObjectName").value = pageObject.name
    document.getElementById("pageElementName").value = element.name
    document.getElementById("isList").checked = element.list
    document.getElementById("elementType").value = element.type
    if (element.wait) {
      document.getElementById("waitTimeInSeconds").value = element.wait.for
    }

    var waitAction = document.getElementById("waitAction")

    if (element.wait) {
      for (var i, j = 0; (i = waitAction.options[j]); j++) {
        if (i.value === element.wait.until) {
          waitAction.selectedIndex = j
          break
        }
      }
    }

    // document.getElementById('locale').selectedIndex = 0;
    document.getElementById("tagName").value = ""
    document.getElementById("tagId").value = ""
    document.getElementById("name").value = ""
    document.getElementById("xpath").value = ""
    document.getElementById("cssPath").value = ""
    document.getElementById("className").value = ""
    document.getElementById("selectedElement_tagId").checked = true

    document.getElementById("updateElementBtn").style.display = "none"
    document.getElementById("addElementBtn").style.display = "none"
    var addLocaleToElementBtn = document.getElementById("addLocaleToElementBtn")
    addLocaleToElementBtn.style.display = ""
    addLocaleToElementBtn.addEventListener(
      "click",
      addLocaleToElementBtnPressed.bind(this, pageObject, element, idX)
    )
  }

  function addLocaleToElementBtnPressed(pageObject, element, idX) {
    var pageObjectId = document.getElementById("elementPageObjectId")

    db.get(pageObjectId.value, function(err, doc) {
      if (!err) {
        var pageElementName = document.getElementById("pageElementName")
        var isListElement = document.getElementById("isList")
        var elementType = document.getElementById("elementType")
        var pageElementVariableDiv = document.getElementById(
          "pageElementVariableDiv"
        )

        if (isEmpty(pageElementName.value)) {
          pageElementVariableDiv.className =
            pageElementVariableDiv.className + " has-error"
        } else if (hasWhiteSpace(pageElementName.value)) {
          pageElementVariableDiv.className =
            pageElementVariableDiv.className + " has-error"
        } else if (!isFirstCharSmall(pageElementName.value)) {
          pageElementVariableDiv.className =
            pageElementVariableDiv.className + " has-error"
        } else {
          var locale = document.getElementById("locale")
          var waitTimeInSeconds = document.getElementById("waitTimeInSeconds")
          var waitAction = document.getElementById("waitAction")
          var tagName = document.getElementById("tagName")
          var tagId = document.getElementById("tagId")
          var name = document.getElementById("name")
          var xpath = document.getElementById("xpath")
          var cssPath = document.getElementById("cssPath")
          var className = document.getElementById("className")
          var selectedElement = document.querySelector(
            'input[name = "selectedElement"]:checked'
          )

          let selectedAttr = ""
          switch (selectedElement.value) {
            case "xpath":
              selectedAttr = `xpath=${xpath.value}`
              break
            case "cssPath":
              selectedAttr = `css=${cssPath.value}`
              break
            case "className":
              selectedAttr = `class=${className.value}`
              break
            case "tagName":
              selectedAttr = `tagName=${tagName.value}`
              break
            case "tagId":
              selectedAttr = `${tagId.value}`
              break
            case "name":
              selectedAttr = `${name.value}`
              break
          }

          doc.elements[idX].name = pageElementName.value
          doc.elements[idX].list = isListElement.checked
          doc.elements[idX].type = elementType.value

          if (waitAction[waitAction.selectedIndex].value !== "") {
            doc.elements[idX].wait.for = +waitTimeInSeconds.value
            doc.elements[idX].wait.until =
              waitAction[waitAction.selectedIndex].value
          }

          doc.elements[idX].locale.push({
            name: locale[locale.selectedIndex].value,
            locator: selectedAttr
          })

          db.put(
            {
              _id: doc._id,
              _rev: doc._rev,
              name: doc.name,
              defaultLocale: doc.defaultLocale,
              elements: doc.elements,
              elementerVersion: doc.elementerVersion
            },
            function(err, response) {
              if (err) {
                elementDangerAlert.style.display = ""

                $("#element-danger-alert").alert()
              } else {
                pageElementName.value = ""
                waitTimeInSeconds.value = 0
                waitAction.selectedIndex = 0
                // locale.selectedIndex = 0;
                tagName.value = ""
                tagId.value = ""
                name.value = ""
                xpath.value = ""
                cssPath.value = ""
                className.value = ""
                document.getElementById("selectedElement_tagId").checked = true
                elementSuccessAlert.style.display = ""

                $("#element-success-alert").alert()
              }
            }
          )
        }
      } else {
        console.log(err)
      }
    })

    console.log("Locale to the Element added")
  }

  function deleteElementButtonPressed(pageObject, idX) {
    db.get(pageObject._id, function(err, doc) {
      if (!err) {
        doc.elements.splice(idX, 1)

        db.put(
          {
            _id: doc._id,
            _rev: doc._rev,
            name: doc.name,
            defaultLocale: doc.defaultLocale,
            elements: doc.elements,
            elementerVersion: doc.elementerVersion
          },
          function(err, response) {
            if (err) {
              console.log(err)
            } else {
              console.log(response)
              console.log("Element deleted Successfully!")
              showSection(pageObjectListSection)
            }
          }
        )
      } else {
        console.log(err)
      }
    })
  }

  function deleteLocaleButtonPressed(pageObject, elementId, localeId) {
    db.get(pageObject._id, function(err, doc) {
      if (!err) {
        doc.elements[elementId].locale.splice(localeId, 1)

        db.put(
          {
            _id: doc._id,
            _rev: doc._rev,
            name: doc.name,
            defaultLocale: doc.defaultLocale,
            elements: doc.elements,
            elementerVersion: doc.elementerVersion
          },
          function(err, response) {
            if (err) {
              console.log(err)
            } else {
              console.log(response)
              console.log("Locale deleted Successfully!")
              showSection(pageObjectListSection)
            }
          }
        )
      } else {
        console.log(err)
      }
    })
  }

  function localeListButtonPressed(pageObject, elementName) {
    showSection(localeListSection)
    setActiveNav(pageObjectListBtn)
    redrawLocaleListUI(pageObject, elementName)
  }

  function editLocaleButtonPressed(pageObject, elementId, localeId) {
    showSection(addElementSection)
    console.log(pageObject)

    var element = pageObject.elements[elementId]
    var localeItem = pageObject.elements[elementId].locale[localeId]

    document.getElementById("elementPageObjectId").value = pageObject._id
    document.getElementById("elementPageObjectName").value = pageObject.name
    document.getElementById("pageElementName").value = element.name
    document.getElementById("isList").checked = element.list
    document.getElementById("elementType").value = element.type

    if (element.wait) {
      document.getElementById("waitTimeInSeconds").value = +element.wait.for
    }
    var waitAction = document.getElementById("waitAction")

    if (element.wait) {
      for (var i, j = 0; (i = waitAction.options[j]); j++) {
        if (i.value === element.wait.until) {
          waitAction.selectedIndex = j
          break
        }
      }
    }

    var locale = document.getElementById("locale")
    for (var i, j = 0; (i = locale.options[j]); j++) {
      if (i.value === localeItem.name) {
        locale.selectedIndex = j
        break
      }
    }
    document.getElementById("tagName").value = ""
    document.getElementById("tagId").value = ""
    document.getElementById("name").value = ""
    document.getElementById("xpath").value = ""
    document.getElementById("cssPath").value = ""
    document.getElementById("className").value = ""
    document.getElementById("selectedElement_tagId").checked = true

    var updateElementBtn = document.getElementById("updateElementBtn")
    updateElementBtn.style.display = ""
    document.getElementById("addElementBtn").style.display = "none"
    document.getElementById("addLocaleToElementBtn").style.display = "none"

    updateElementBtn.addEventListener(
      "click",
      updateElementBtnPressed.bind(this, pageObject, elementId, localeId)
    )
  }

  function createLocaleListItem(pageObject, elementId, localeId) {
    var editLocaleButton = document.createElement("button")
    editLocaleButton.className = "btn btn-default"
    editLocaleButton.innerHTML = "Edit"
    editLocaleButton.addEventListener(
      "click",
      editLocaleButtonPressed.bind(this, pageObject, elementId, localeId)
    )

    var deleteLocaleButton = document.createElement("button")
    deleteLocaleButton.className = "btn btn-danger"
    deleteLocaleButton.innerHTML = "Delete"
    deleteLocaleButton.addEventListener(
      "click",
      deleteLocaleButtonPressed.bind(this, pageObject, elementId, localeId)
    )

    var divButtons = document.createElement("div")
    divButtons.style.display = "none"
    divButtons.className = "btn btn-group"
    divButtons.setAttribute("role", "group")

    divButtons.appendChild(editLocaleButton)
    divButtons.appendChild(deleteLocaleButton)

    var labelLink = document.createElement("a")
    labelLink.style.cursor = "pointer"
    labelLink.appendChild(
      document.createTextNode(
        `${pageObject.elements[elementId].locale[localeId].name} {${pageObject.elements[elementId].locale[localeId].locator}}`
      )
    )
    labelLink.addEventListener(
      "click",
      function(event) {
        if (divButtons.style.display === "none") {
          divButtons.style.display = ""
        } else {
          divButtons.style.display = "none"
        }
      },
      false
    )

    var li = document.createElement("li")
    li.id = "li_" + pageObject._id + "#" + elementId + "#" + localeId
    li.appendChild(labelLink)
    li.appendChild(divButtons)

    return li
  }

  function createElementListItem(pageObject, element, idX) {
    var addLocaleElementButton = document.createElement("button")
    addLocaleElementButton.className = "btn btn-default"
    addLocaleElementButton.innerHTML = "Add Locale"
    addLocaleElementButton.addEventListener(
      "click",
      addLocaleElementButtonPressed.bind(this, pageObject, element, idX)
    )

    var localeListButton = document.createElement("button")
    localeListButton.className = "btn btn-default"
    localeListButton.innerHTML = "Locale List"
    localeListButton.addEventListener(
      "click",
      localeListButtonPressed.bind(this, pageObject, element.name)
    )

    var deleteElementButton = document.createElement("button")
    deleteElementButton.className = "btn btn-danger"
    deleteElementButton.innerHTML = "Delete"
    deleteElementButton.addEventListener(
      "click",
      deleteElementButtonPressed.bind(this, pageObject, idX)
    )

    var divButtons = document.createElement("div")
    divButtons.style.display = "none"
    divButtons.className = "btn btn-group"
    divButtons.setAttribute("role", "group")

    // divButtons.appendChild(editElementButton);
    divButtons.appendChild(addLocaleElementButton)
    divButtons.appendChild(localeListButton)
    divButtons.appendChild(deleteElementButton)

    var labelLink = document.createElement("a")
    labelLink.style.cursor = "pointer"
    labelLink.appendChild(document.createTextNode(element.name))
    labelLink.addEventListener(
      "click",
      function(event) {
        if (divButtons.style.display === "none") {
          divButtons.style.display = ""
        } else {
          divButtons.style.display = "none"
        }
      },
      false
    )

    var li = document.createElement("li")
    li.id = "li_" + pageObject._id + "#" + element.name
    li.appendChild(labelLink)
    li.appendChild(divButtons)

    return li
  }

  function createPageObjectListItem(pageObject) {
    var editPageObjectButton = document.createElement("button")
    editPageObjectButton.className = "btn btn-default"
    editPageObjectButton.innerHTML = "Edit"
    editPageObjectButton.addEventListener(
      "click",
      editPageObjectButtonPressed.bind(this, pageObject)
    )

    var addElementBtn = document.createElement("button")
    addElementBtn.className = "btn btn-default"
    addElementBtn.innerHTML = "Add Element"
    addElementBtn.addEventListener(
      "click",
      addElementButtonPressed.bind(this, pageObject)
    )

    var elementsListBtn = document.createElement("button")
    elementsListBtn.className = "btn btn-default"
    elementsListBtn.innerHTML = "Elements"
    elementsListBtn.addEventListener(
      "click",
      elementsListButtonPressed.bind(this, pageObject)
    )

    var exportJsonBtn = document.createElement("a")
    exportJsonBtn.className = "btn btn-default"
    exportJsonBtn.download = pageObject.name + ".json"
    exportJsonBtn.innerHTML = "Export Json"
    exportJsonBtn.addEventListener(
      "click",
      function(event) {
        // Clone the object without reference
        var str = JSON.parse(JSON.stringify(pageObject))

        // Delete the _id and _rev
        delete str._id
        delete str._rev

        // Save the file contents as DataURI
        var dataUri =
          "data:application/json;charset=utf-8," +
          encodeURIComponent(JSON.stringify(str, null, 2))

        // Write it as the href for the link
        var link = (event.target.href = dataUri)
      },
      false
    )

    var deletePageObjectBtn = document.createElement("button")
    deletePageObjectBtn.className = "btn btn-danger"
    deletePageObjectBtn.innerHTML = "Delete"
    deletePageObjectBtn.addEventListener(
      "click",
      deletePageObjectBtnPressed.bind(this, pageObject)
    )

    var divDisplay = document.createElement("div")
    divDisplay.className = "view"
    divDisplay.appendChild(editPageObjectButton)
    divDisplay.appendChild(addElementBtn)
    divDisplay.appendChild(elementsListBtn)
    divDisplay.appendChild(exportJsonBtn)
    divDisplay.appendChild(deletePageObjectBtn)
    divDisplay.style.display = "none"
    divDisplay.className = "btn btn-group"
    divDisplay.setAttribute("role", "group")

    var labelLink = document.createElement("a")
    labelLink.style.cursor = "pointer"
    labelLink.appendChild(document.createTextNode(pageObject.name))
    labelLink.addEventListener(
      "click",
      function(event) {
        if (divDisplay.style.display === "none") {
          divDisplay.style.display = ""
        } else {
          divDisplay.style.display = "none"
        }
      },
      false
    )

    var li = document.createElement("li")
    li.id = "li_" + pageObject._id
    li.appendChild(labelLink)
    li.appendChild(divDisplay)

    return li
  }

  function redrawPageObjectsUI(pageObjects) {
    var ul = document.getElementById("pageObjectList")
    ul.innerHTML = ""

    pageObjects.forEach(function(pageObject) {
      ul.appendChild(createPageObjectListItem(pageObject.doc))
    })
  }

  function showImportJsonSectionListener(event) {
    event.preventDefault()
    showSection(importJsonSection)
    setActiveNav(importJsonBtn)
  }

  function init() {
    console.log("init")
    elementSuccessAlert.style.display = "none"
    elementDangerAlert.style.display = "none"

    setActiveNav(showPageObjectListBtn)
    showSection(pageObjectListSection)

    document.getElementById("elementer-version").innerHTML = manifest.version
  }

  init()
  addEventListeners()
  showPageObjects()
})()
