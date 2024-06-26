<script>
  import { FluentBundle, FluentResource } from "@fluent/bundle";
  import { negotiateLanguages } from "@fluent/langneg";
  import { writable, derived, get } from "svelte/store";
  import { flip } from "svelte/animate";
  import { send, receive } from "./transition"
  import { fade, fly } from "svelte/transition";
  import StardewBox from "./components/StardewBox.svelte";
  import DialogueMakerModal from "./components/DialogueMakerModal.svelte";
    import DeleteWarningModal from "./components/QuestionModal.svelte";
    import QuestionModal from "./components/QuestionModal.svelte";

  const controlColourCodes = {
    "0": "p8-black",
    "1": "p8-dark-blue",
    "2": "p8-dark-purple",
    "3": "p8-dark-green",
    "4": "p8-brown",
    "5": "p8-darkgrey",
    "6": "p8-lightgrey",
    "7": "p8-white",
    "8": "p8-red",
    "9": "p8-orange",
    "10": "p8-yellow",
    "11": "p8-green",
    "12": "p8-blue",
    "13": "p8-lavender",
    "14": "p8-pink",
    "15": "p8-light-peach",
    "-16": "p8-extra-brownish-black",
    "-15": "p8-extra-darker-blue",
    "-14": "p8-extra-darker-purple",
    "-13": "p8-extra-turquoise",
    "-12": "p8-extra-dark-brown",
    "-11": "p8-extra-darker-grey",
    "-10": "p8-extra-medium-grey",
    "-9": "p8-extra-banana-yellow",
    "-8": "p8-extra-dark-red",
    "-7": "p8-extra-dark-orange",
    "-6": "p8-extra-lime-green",
    "-5": "p8-extra-medium-green",
    "-4": "p8-extra-deep-blue",
    "-3": "p8-extra-mauve",
    "-2": "p8-extra-dark-peach",
    "-1": "p8-extra-medium-peach"
  };

  let preferredLanguages = navigator.languages.slice();
  const AVAILABLE_LANGS = ["en-GB", "en-US","de-DE", "pt-BR", "nl-NL","ja-JP", "sl-SI", "mn", "iu", "ar"];
  const DEFAULT_LANG = "en-GB";
  const supportedLocales = negotiateLanguages(
    navigator.languages,
    AVAILABLE_LANGS,
    { defaultLocale: DEFAULT_LANG }
  );
  
  export const testLocaleCount = writable(supportedLocales.length);
  export const chosenLocale = writable(supportedLocales[0]);
  $: fluentDebugMode = false;

  let langResourceMap = new Map();

  export const stardewPlayerGender = writable("male");
  let showDialogueModal = false;
  let showDeleteModal = false;
  let editMode = false;
  let warnOnDelete = true;
  let userChoseDelete = false;
  let currentStringEditIndex = -1;
  $: inputString = "";

  async function loadFluentResources() {
    for await (const lang of AVAILABLE_LANGS) {
      // console.log(lang);
      const response = await fetch(`/locales/${lang}.ftl`);
      const resource = new FluentResource(await response.text());
      let newBundle = new FluentBundle([lang]);
      let errors = newBundle.addResource(resource);
      if (errors.length) {
        for (const e of errors){
          console.log(e.message);
        }
      }
      langResourceMap.set(lang,newBundle);
    }
  }

  $: getMessage = (messageId, params = null) => {
    try {
      if (fluentDebugMode) {
        return `<fluent:${messageId}>`;
      }
      let bnd = langResourceMap.get($chosenLocale);
      let msg = bnd.getMessage(messageId);
      if (msg.value) {
        if (params != null) {
          return bnd.formatPattern(msg.value, params);
        }
        return msg.value;
      } else {
        bnd = langResourceMap.get(DEFAULT_LANG);
        msg = bnd.getMessage(messageId);
        if (msg.value) {
          if (params != null) {
            return bnd.formatPattern(msg.value, params);
          }
          return msg.value;
        } else {
          return messageId;
        }
      }
      
    } catch (error) {
      console.trace(error);
      return `<fluent:${messageId}>`;
    }
  }
  
  function setBodyLangAttr(lc) {
    document.body.lang = lc;
  }
  const stardewTestDialogue = "${Oh... you're that new farmer boy, aren't you?^Oh... You're that new farmer girl, or whatever. Aren't you?}$$l#$e#Huh? Oh... I'm Haley.#$e#${Hmm... If it weren't for those horrendous clothes you might actually be cute.^Hmm... If it weren't for those horrendous clothes you might actually be pretty... Actually, never mind.^Hmm... If it weren't for those horrendous clothes you might actually be attractive.}$$h"
  // $: stardewSplitDialogue = [{male: { text: null, expression: null }, female: { text: null, expression: null }, nonbinary: { text: null, expression: null}}];
  export const stardewSplitDialogue = writable(updateStardewDialogueParse(inputString));
  $: stardewDisplayDialogue = $stardewSplitDialogue;
  // stardewSplitDialogue = updateStardewDialogueParse(stardewTestDialogue);
  export const rawOutputString = derived(stardewSplitDialogue, encodeDialogueArray);

  function encodeDialogueArray(msgArray) {
    let outputString = "";
    for (let i=0;i<msgArray.length;i++) {
      let msg = msgArray[i];
      // console.log(msg);
      if (msg.type == "dialogue") {
        // Handle gender-switch command
        if (msg.female.text != null && msg.nonbinary.text != null) {
          // has all 3 texts
          let sameExpressions = (msg.male.expression == msg.female.expression == msg.nonbinary.expression);
          if (msg.male.expression && sameExpressions) {
            let expr = "";
            expr = msg.male.expression;
            outputString = outputString.concat(`\$\{${msg.male.text}^${msg.female.text}^${msg.nonbinary.text}\}\$\$${expr}`);
            // console.log(`3 with same expr: ${outputString}`);
          } else {
            outputString = outputString.concat(`\$\{${msg.male.text}\$${msg.male.expression}^${msg.female.text}\$${msg.female.expression}^${msg.nonbinary.text}\$${msg.nonbinary.expression}\}\$`);
            // console.log(`3 with different expr: ${outputString}`);
          }
        }
        else if (msg.male.expression && msg.female.text != null) {
          // has male and female
          let sameExpressions = (msg.male.expression == msg.female.expression);
          let expr = "";
          if (sameExpressions) {
            expr = msg.male.expression;
            outputString = outputString.concat(`\$\{${msg.male.text}^${msg.female.text}\}\$\$${expr}`);
            // console.log(`2 with same expr: ${msg.male.text} :: ${msg.female.text}`);
          } else {
            outputString = outputString.concat(`\$\{${msg.male.text}\$${msg.male.expression}^${msg.female.text}\$${msg.female.expression}\}\$`);
          }
        }
        else {
          // same text for all genders
          if (msg.male.text) {
            outputString = outputString.concat(`${msg.male.text}`);
          }
          if (msg.male.expression) {
            outputString = outputString.concat(`\$${msg.male.expression}`);
          }
        }
        // console.log(outputString);
      }
      if (i < msgArray.length-1) {
        outputString = outputString.concat("#");
      }
    }
    // console.log(outputString);
    return outputString;
  }

  function updateStardewDialogueParse(text) {
    if (!text) {
      text = "";
    }
    let quotesRegex = /\"([^\"]+)\"/;
    if (text.match(quotesRegex)) {
      text = text.replace(quotesRegex,"$1");
    }

    let arr = text.split("#");
    // console.log(arr);
    let formattedArr = [];
    if (arr.length < 1) {
      arr[0] = text;
    }
    for (let i=0;i < arr.length; i++) {
      // console.log(arr[i]);
      let msgText = {
        type: "dialogue",
        male: {
          text: arr[i],
          expression: ""
        },
        female: {
          text: null,
          expression: ""
        },
        nonbinary: 
          {
          text: null,
          expression: ""
        }};
      // Handle gender-specific splits
      let genderSplitRegex = /\$\{(?<male>[^\^]+)\^(?<female>[^\^]+)(\^(?<nonb>.+))?\}\$/;
      let match = arr[i].match(genderSplitRegex);
      if (match) {
        msgText.male.text = arr[i].replace(genderSplitRegex, match.groups.male);
        msgText.female.text = arr[i].replace(genderSplitRegex, match.groups.female);
        if (match.groups.nonb) {
          msgText.nonbinary.text = arr[i].replace(genderSplitRegex, match.groups.nonb);
        }
      }
      // Is expression same for all genders?
      let sameExpressionMatch = stardewParseExpression(arr[i]);
      // let fullText = sameExpressionMatch.text;
      // if (sameExpressionMatch.text) {
      //   msgText.male.text = fullText;
      // } else {
      //   fullText = arr[i];
      // } 

      if (sameExpressionMatch.expression) {
        // Expression is same for all genders
        // ${male^female^nonbinary}$$h for example
        msgText.male.expression = sameExpressionMatch.expression;
        msgText.female.expression = sameExpressionMatch.expression;
        msgText.nonbinary.expression = sameExpressionMatch.expression;
      }
      
      let mObj = stardewParseExpression(msgText.male.text);
      msgText.male.text = mObj.text;
      msgText.male.expression = mObj.expression;
      if (msgText.female.text) {
        let fObj = stardewParseExpression(msgText.female.text);
        msgText.female.text = fObj.text;
        if (!sameExpressionMatch.expression) {
          msgText.female.expression = fObj.expression;
        }
      }
      if (msgText.nonbinary.text) {
        let nObj = stardewParseExpression(msgText.nonbinary.text);
        msgText.nonbinary.text = nObj.text;
        if (!sameExpressionMatch.expression) {
          msgText.nonbinary.expression = nObj.expression;
        }
      }
      
      console.log(msgText);

      // console.log(msgText);
      if (msgText.male.text) {
        formattedArr.push(msgText);
      }
    }
    // console.log(formattedArr);
    return formattedArr;
  }

  function stardewParseExpression(text) {
     // Set expression from dialogue commands
     let match = text.match(/\$([hsula])$/);
      // console.log(match);
      let expr = "";
      if (match) {
        expr = match[1];
        // console.log(`match: ${match[1]}`);
        // switch (match[1]) {
        //   case "h": { expr = "🙂"; break; }
        //   case "s": { expr = "😞"; break; }
        //   case "l": { expr = "😍"; break; }
        //   case "u": { expr = "🥴"; break; }
        //   case "a": { expr = "😡"; break; }
        // }
        text = text.replace(/\$([hsula])$/,"");
      }
      return {text: text, expression: expr};
  }

  function generateLetters(count) {
    let str = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i=0;i<count;i++) {
      str += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    // console.log(str);
    return str;
  }

  chosenLocale.subscribe(setBodyLangAttr);
  // chosenLocale.subscribe((_) => {
  //   stardewSplitDialogue.update() = updateStardewDialogueParse(stardewTestDialogue)
  // });
  // stardewPlayerGender.subscribe(updateStardewDialogueParse);
  // formattedText.sub
  
  let x = loadFluentResources();

  (() => {
    'use strict'
  
    const getStoredTheme = () => localStorage.getItem('theme')
    const setStoredTheme = theme => localStorage.setItem('theme', theme)
  
    const getPreferredTheme = () => {
      const storedTheme = getStoredTheme()
      if (storedTheme) {
        return storedTheme
      }
  
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
  
    const setTheme = (theme) => {
      if (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-bs-theme', 'dark')
      } else {
        document.documentElement.setAttribute('data-bs-theme', theme)
      }
    }
  
    setTheme(getPreferredTheme())
  
    const showActiveTheme = (theme, focus = false) => {
      const themeSwitcher = document.querySelector('#bd-theme')
  
      if (!themeSwitcher) {
        return
      }
  
      const themeSwitcherText = document.querySelector('#bd-theme-text')
      const activeThemeIcon = document.querySelector('.theme-icon-active use')
      const btnToActive = document.querySelector(`[data-bs-theme-value="${theme}"]`)
      const svgOfActiveBtn = btnToActive.querySelector('svg use').getAttribute('href')
  
      document.querySelectorAll('[data-bs-theme-value]').forEach(element => {
        element.classList.remove('active')
        element.setAttribute('aria-pressed', 'false')
      })
  
      btnToActive.classList.add('active')
      btnToActive.setAttribute('aria-pressed', 'true')
      activeThemeIcon.setAttribute('href', svgOfActiveBtn)
      const themeSwitcherLabel = `${themeSwitcherText.textContent} (${btnToActive.dataset.bsThemeValue})`
      themeSwitcher.setAttribute('aria-label', themeSwitcherLabel)
  
      if (focus) {
        themeSwitcher.focus()
      }
    }
  
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      const storedTheme = getStoredTheme()
      if (storedTheme !== 'light' && storedTheme !== 'dark') {
        setTheme(getPreferredTheme())
      }
    })
  
    window.addEventListener('DOMContentLoaded', () => {
      showActiveTheme(getPreferredTheme())
  
      document.querySelectorAll('[data-bs-theme-value]')
        .forEach(toggle => {
          toggle.addEventListener('click', () => {
            const theme = toggle.getAttribute('data-bs-theme-value')
            setStoredTheme(theme)
            setTheme(theme)
            showActiveTheme(theme, true)
          })
        })
    });
  })()
  console.log($stardewSplitDialogue);
</script>

<main>
  {#await x}
    <p>Loading...</p>
  {:then}
  <nav class="navbar navbar-expand-md stardew-text-scroll">
    <div class="container-fluid">
      <h1>{getMessage("page-header")}</h1>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarToggler" aria-controls="navbarToggler" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarToggler">
          <form class="d-flex mx-2">
            <div class="form-check form-check-inline">
              <label class="form-label" for="fluent-debug-checkbox">Toggle Fluent debug mode</label>
              <input class="form-check-input" type="checkbox" id="fluent-debug-checkbox" bind:checked={fluentDebugMode} />
            </div>
          </form>
          <form class="d-flex mx-2">
            <div class="form-check form-check-inline">
              <label class="form-label" for="warn-on-dialogue-delete-checkbox">{getMessage("stardew-dialogue-maker-warn-on-dialogue-delete-checkbox")}</label>
              <input class="form-check-input" type="checkbox" id="warn-on-dialogue-delete-checkbox" bind:checked={warnOnDelete} />
            </div>
          </form>
      </div>
    </div>
  </nav>
    <div class="container-lg stardew-text-box py-2">
      <form>
        <div class="row g-2">
            <div class="col-md-auto">
              <label class="form-label visually-hidden" for="language-select">{getMessage("language-select")}</label>
              <select class="form-select" id="language-select" bind:value={$chosenLocale}>
                {#each AVAILABLE_LANGS as lang}
                <option value={lang}>{ getMessage(`locale-flag-${lang.toLowerCase()}`) } { getMessage(`locale-name-${lang.toLowerCase()}`) }</option>
                {/each}
              </select>
            </div>
            <div class="col-md-auto">
              <input class="form-control" type="number" bind:value={$testLocaleCount} min="1" aria-label="Number formatting test" />   
            </div>
            <div class="col-md-auto">
              <select class="form-select" bind:value={$stardewPlayerGender} aria-label={getMessage("farmer-gender-select-label")}>
                <option value="male">{getMessage("farmer-gender-select-male")}</option>
                <option value="female">{getMessage("farmer-gender-select-female")}</option>
                <option value="nonbinary">{getMessage("farmer-gender-select-nonbinary")}</option>
              </select>
            </div>
        </div>
      </form>


      <p>{ getMessage("preferred-languages") }</p>
      <ol>
        {#each preferredLanguages as lang}
        <li>{lang}</li>
        {/each}
      </ol>
      <p>{ getMessage("browser-locales-count", {localeCount: ($testLocaleCount) ? $testLocaleCount : supportedLocales.length}) }</p>
 
      <!-- <StardewBox>
        <p slot="text">Hello world!</p>
        <h1 slot="expression">🙂</h1>
      </StardewBox> -->
      <form class="row">
        <div class="col-12">

          <label class="form-label" for="string-input-texarea">
            {getMessage("stardew-dialogue-maker-input-string-input-label")}
          </label>
          <input class="form-control mb-2" id="string-input-input" placeholder={getMessage("stardew-dialogue-maker-input-string-input-placeholder")} bind:value={inputString} />
        </div>
        <div class="col-auto mx-auto">
          <button class="btn btn-primary border border-secondary" on:click|preventDefault={(e) => $stardewSplitDialogue = updateStardewDialogueParse(inputString)} disabled={!inputString}>
            {getMessage("stardew-dialogue-maker-input-parse-button")}
          </button>
        </div>

      </form>
      
      {#if $stardewSplitDialogue.length}
      <ul class="list-unstyled">

        {#each stardewDisplayDialogue as msg, i (msg)}
        <li
          in:fly={{ y: 100, duration: 400 }}
          out:fade={{ duration: 200 }}
          animate:flip={{ duration: 400 }}>
          <StardewBox hasFemale={msg.female.text != null} hasNonbinary={msg.nonbinary.text != null} suffix={generateLetters(6)} bind:getMessage> 
            <span slot="male">
              <p class="stardew-dialogue">{msg.male.text}</p>
              <h2 class="stardew-expression">{msg.male.expression}</h2>
            </span>
            <div slot="female">
              <p class="stardew-dialogue">{msg.female.text}</p>
              <h2 class="stardew-expression">{msg.female.expression}</h2>
            </div>
            <div slot="nonbinary">
              <p class="stardew-dialogue">{msg.nonbinary.text}</p>
              <h2 class="stardew-expression">{msg.nonbinary.expression}</h2>
            </div>
          </StardewBox>
          <div class="d-grid d-md-block gap-2 mb-2">
            <button class="btn btn-primary border border-secondary" on:click={(e)=> {currentStringEditIndex = i; showDialogueModal = true; editMode = true}}>{getMessage("stardew-dialogue-maker-edit-button")}</button>
            <button class="btn btn-primary border border-secondary" on:click={(e)=> {currentStringEditIndex = i; showDialogueModal = true; editMode=false}}>{getMessage("stardew-dialogue-maker-add-new-text")}</button>
            <button class="btn btn-primary border border-secondary">{getMessage("stardew-dialogue-maker-add-new-command")}</button>
            <button class="btn btn-danger border border-danger-subtle"
            on:click={(e)=> {
              currentStringEditIndex = i;
              if (warnOnDelete) {
                showDeleteModal = true;
              }
            }}>{getMessage("stardew-dialogue-maker-delete-message")}</button>
      </div>
    </li>
    {/each}
    </ul>
      {:else}
        <p>{getMessage("message-list-no-messages")}</p>
        <div class="row">
          <div class="col-12 text-center">
            <button class="btn btn-primary border-primary-subtle"
            on:click={(e) => {
              currentStringEditIndex = 0; showDialogueModal = true;
            }}
            on:close={(e) => {
              if (e.returnValue) {

              }
            }}>
              {getMessage("stardew-dialogue-maker-add-new-message")}
            </button>
          </div>
        </div>
      {/if}

      <div>
        <label class="form-label" for="dialogue-raw-string-code">{getMessage("stardew-dialogue-maker-raw-output-label")}</label>
        <p>
          <code id="dialogue-raw-string-code">{$rawOutputString}</code>
        </p>

      </div>
      
      <DialogueMakerModal bind:showModal={showDialogueModal} bind:getMessage bind:textArray={$stardewSplitDialogue} bind:msgIndex={currentStringEditIndex} bind:editMode></DialogueMakerModal>
      <QuestionModal bind:showModal={showDeleteModal} bind:getMessage bind:textArray={$stardewSplitDialogue} bind:msgIndex={currentStringEditIndex} >
        <span slot="header-text">{getMessage("delete-warning-header")}</span>
        <span slot="question">{getMessage("delete-warning-question")}</span>
        <span slot="yes-button">{getMessage("delete-warning-yes-button")}</span>
        <span slot="no-button">{getMessage("delete-warning-no-button")}</span>
      </QuestionModal>


      <!-- <form>
        <button type="button" class="mb-2 btn btn-primary" on:click={ addPicoMessage(getMessage("pico8-add-message-placeholder"))}>{ getMessage("pico8-add-message")}</button>
      </form>
      {#if picoText}
      <form class="mb-2">
        {#each picoText as s}
        <div class="row mb-2 form-group ">
          <div class="col-12 col-lg-6">
            <input class="mb-1 form-control form-control-sm" type="text" bind:value={s} />
          </div>
          <p class="col-12 col-lg-6 pico-string" on:change={this.innerHTML = formatText(s)}>{@html formatText(s)}</p>
        </div>
          {/each}
      </form>
      {/if} -->
    </div>
  {/await}
  
</main>
