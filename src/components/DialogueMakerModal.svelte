<script>
    import ModalDialogue from "./ModalDialogue.svelte"

    export let getMessage; // i18n function
    export let showModal; // bool
    export let textArray; // string[]
    export let msgIndex; // number
    export let editMode; // bool

    let dialogue; // HTMLDialogElement

    
    let maleDialogue;
    let maleExpression;
    let femaleDialogue;
    let femaleExpression;
    let nonbinaryDialogue;
    let nonbinaryExpression;
    
    $: hasFemale = (femaleDialogue); // bool
    $: hasNonbinary = (nonbinaryDialogue); // bool
    let validData; // bool

    $: if (dialogue && showModal) {
        if (!dialogue.open) {
            console.log("Hello");
            if (editMode) {
                maleDialogue = textArray[msgIndex].male.text;
                maleExpression = textArray[msgIndex].male.expression;
                femaleDialogue = textArray[msgIndex].female.text;
                femaleExpression = textArray[msgIndex].female.expression;
                nonbinaryDialogue = textArray[msgIndex].nonbinary.text;
                nonbinaryExpression = textArray[msgIndex].nonbinary.expression;
            } else {
                maleExpression = "";
                femaleExpression = "";
                nonbinaryExpression = "";
            }
            dialogue.showModal();
        }
        // console.log(msgIndex);
        // console.log(maleDialogue);
    }

    $: validData = () => {
        if (maleDialogue) {
            if (hasFemale) {
                if (femaleDialogue) {
                    if (hasNonbinary) {
                        if (nonbinaryDialogue) {
                            return true;
                        }
                    }
                    return true;
                }
            }
            return true;
        }
        return false;
    }

    function submitDialogue(e) {
        e.preventDefault();
        console.log(msgIndex);
        if (msgIndex != null) {
            if (editMode) {
                textArray[msgIndex].male.text = maleDialogue;
                textArray[msgIndex].male.expression = maleExpression;
                textArray[msgIndex].female.text = femaleDialogue;
                textArray[msgIndex].female.expression = femaleExpression;
                textArray[msgIndex].nonbinary.text = nonbinaryDialogue;
                textArray[msgIndex].nonbinary.expression = nonbinaryExpression;
                textArray = textArray;
            } else {
                let msgObject = {
                    type: "dialogue",
                    male: {
                        text: maleDialogue,
                        expression: maleExpression
                    },
                    female: {
                        text: femaleDialogue,
                        expression: femaleExpression
                    },
                    nonbinary: {
                        text: nonbinaryDialogue,
                    expression: nonbinaryExpression
                }
            };
                textArray.splice(msgIndex+1,0,msgObject);
                textArray = textArray;
            }
            // console.log(textArray);
            showModal = false;
            dialogue.close();
        }
    
    }

    function onCancel(e) {
        maleDialogue = null;
        maleExpression = null;
        femaleDialogue = null;
        femaleExpression = null;
        nonbinaryDialogue = null;
        nonbinaryExpression = null;
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<ModalDialogue
    bind:showModal bind:dialogue
>
    <h1 slot="dialogue-header" class="text-center">{getMessage("stardew-dialogue-maker-add-new-text")}</h1>
    <form
        slot="dialogue-body"
        class="row g-2 needs-validation"
        on:submit={submitDialogue}
    >
        <div class="col-md-8">
            <label class="form-label" for="male-dialogue-text-input">
                <input
                    class="form-check-input"
                    type="checkbox"
                    id="male-dialogue-enabled-check"
                    checked
                    disabled/>
                <label
                    class="form-check-label"
                    for="male-dialogue-enabled-check">
                    {#if !hasFemale} {getMessage("stardew-dialogue-maker-gender-any")}
                    {:else}{getMessage("stardew-dialogue-maker-gender-male")}
                    {/if}
                </label>
            </label>
            <input
                class="form-control bg-secondary border border-primary"
                id="male-dialogue-text-input"
                spellcheck="true"
                placeholder={getMessage("stardew-dialogue-maker-text-placeholder")}
                on:change={validData}
                bind:value={maleDialogue}
                required={true}
            />
        </div>
        <div class="col-md-4">
            <label class="form-label" for="male-expression-select">
                {getMessage("stardew-dialogue-maker-expression-select")}
            </label>
            <select class="form-select bg-secondary border border-primary" id="male-expression-select" bind:value={maleExpression}>
                <option value="">{getMessage("stardew-dialogue-maker-expression-default")}</option>
                <option value="h">{getMessage("stardew-dialogue-maker-expression-happy")}</option>
                <option value="s">{getMessage("stardew-dialogue-maker-expression-sad")}</option>
                <option value="l">{getMessage("stardew-dialogue-maker-expression-laughing")}</option>
                <option value="u">{getMessage("stardew-dialogue-maker-expression-unique")}</option>
                <option value="a">{getMessage("stardew-dialogue-maker-expression-angry")}</option>
            </select>
        </div>



        <div class="col-md-8">
            <label class="form-label" for="female-dialogue-text-input">
                <input
                    class="form-check-input bg-secondary border border-primary"
                    type="checkbox"
                    id="female-dialogue-enabled-check"
                    on:change={validData}
                    bind:checked={hasFemale}
                    disabled={hasNonbinary}
                     />
                <label
                    class="form-check-label"
                    for="female-dialogue-enabled-check">
                    {getMessage("stardew-dialogue-maker-gender-female")}
                </label>
            </label>
            {#if hasFemale}
            <input
            class="form-control bg-secondary border border-primary"
            id="female-dialogue-text-input"
            spellcheck="true"
            placeholder={getMessage("stardew-dialogue-maker-text-placeholder")}
            on:change={validData}
            required={hasFemale}
            bind:value={femaleDialogue}
            />
            {/if}
        </div>
        <div class="col-md-4">
            {#if hasFemale}
            <label class="form-label" for="female-expression-select">
                {getMessage("stardew-dialogue-maker-expression-select")}
            </label>
            <select class="form-select bg-secondary border" id="female-expression-select" bind:value={femaleExpression}>
                <option value="">{getMessage("stardew-dialogue-maker-expression-default")}</option>
                <option value="h">{getMessage("stardew-dialogue-maker-expression-happy")}</option>
                <option value="s">{getMessage("stardew-dialogue-maker-expression-sad")}</option>
                <option value="l">{getMessage("stardew-dialogue-maker-expression-laughing")}</option>
                <option value="u">{getMessage("stardew-dialogue-maker-expression-unique")}</option>
                <option value="a">{getMessage("stardew-dialogue-maker-expression-angry")}</option>
            </select>
            {/if}
        </div>

        <div class="col-md-8">
            <label class="form-label" for="nonbinary-dialogue-text-input">
                <input
                    class="form-check-input bg-secondary border border-primary"
                    type="checkbox"
                    id="nonbinary-dialogue-enabled-check"
                    on:change={validData}
                    bind:checked={hasNonbinary}
                    disabled={!hasFemale}
                        />
                <label
                    class="form-check-label"
                    for="nonbinary-dialogue-enabled-check">
                    {getMessage("stardew-dialogue-maker-gender-nonbinary")}
                </label>
            </label>
            {#if hasNonbinary}
            <input
                class="form-control bg-secondary border border-primary"
                id="nonbinary-dialogue-text-input"
                spellcheck="true"
                placeholder={getMessage("stardew-dialogue-maker-text-placeholder")}
                on:change={validData}
                required={hasNonbinary}
                bind:value={nonbinaryDialogue}
            />
            {/if}
        </div>
        <div class="col-md-4">
            {#if hasNonbinary}
            <label class="form-label" for="nonbinary-expression-select">
                {getMessage("stardew-dialogue-maker-expression-select")}
            </label>
            <select class="form-select bg-secondary border border-primary" id="nonbinary-expression-select" bind:value={nonbinaryExpression}>
                <option value="">{getMessage("stardew-dialogue-maker-expression-default")}</option>
                <option value="h">{getMessage("stardew-dialogue-maker-expression-happy")}</option>
                <option value="s">{getMessage("stardew-dialogue-maker-expression-sad")}</option>
                <option value="l">{getMessage("stardew-dialogue-maker-expression-laughing")}</option>
                <option value="u">{getMessage("stardew-dialogue-maker-expression-unique")}</option>
                <option value="a">{getMessage("stardew-dialogue-maker-expression-angry")}</option>
            </select>
            {/if}
        </div>
        

        <div class="row my-2">
            <div class="col-auto mx-auto">
                <button
                    class="btn btn-primary border border-secondary"
                    disabled={!validData}
                    type="submit">
                    {#if editMode}{getMessage("stardew-dialogue-maker-save-changes-button")}
                    {:else}{getMessage("stardew-dialogue-maker-add-new-message")}
                    {/if}</button>
            </div>
        </div>
    </form>
</ModalDialogue>

<style>
    
</style>