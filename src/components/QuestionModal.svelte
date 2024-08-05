<script lang="ts">
    import ModalDialogue from "./ModalDialogue.svelte";
    import type {DialogueMessage} from "../types/types";

    export let showModal: boolean
    export let getMessage:(messageId: string, params?: any) => string; // i18n function
    export let textArray:DialogueMessage[]; // array of msg objects
    export let msgIndex: number; // integer, array index of current message
    export let runCloseInstantly: boolean;
    let response;
    let dialogue;

    function onClose(e) {
        showModal = false;
        dialogue.close();
        if (e.defaultPrevented) {
            response = true;
            textArray.splice(msgIndex,1);
            textArray = textArray;
        }
    }

</script>

<ModalDialogue
    bind:dialogue bind:showModal on:close={onClose}>
    <h1 slot="dialogue-header" class="text-center">
        <slot name="header-text">Question</slot>
    </h1>
    <div slot="dialogue-body">
        <slot name="question">
            Lorem ipsum, dolor sit amet consectetur adipisicing elit?
        </slot>
        <form class="row g-2">
            <button class="btn btn-primary border border-primary-subtle" id="no-button" on:click={onClose} formmethod="dialog" value="no" >
                <slot name="no-button">getMessage("generic-prompt-no")</slot>
            </button>
            <button class="btn btn-danger border border-danger-subtle" id="yes-button" type="submit" on:click|preventDefault={onClose} value="yes">
                <slot name="yes-button">getMessage("generic-prompt-yes")</slot>
            </button>
        </form>
    </div>
</ModalDialogue>