<script lang="ts">
    import StardewBox from "./StardewBox.svelte";
    import type { DialogueMessage } from "../types/types";

    export let message: DialogueMessage = null;
    export let hasFemale: boolean = false;
    export let hasNonbinary: boolean = false;
    export let suffix: string = "";
    export let getMessage: (messageId: string, params?: any) => string; // i18n function

    $: {
        hasFemale = (message.female.text != null);
        hasNonbinary = (message.nonbinary.text != null);
    }
</script>


<!-- Nav tabs -->
<ul class="nav nav-tabs d-flex" id="dialogue-{suffix}" role="tablist">
    <li class="nav-item" role="presentation">
        <button class="nav-link active" id="male-tab" data-bs-toggle="tab" data-bs-target="#male-{suffix}" type="button" role="tab" aria-controls="male" aria-selected="true">
        {#if hasFemale}{getMessage("stardew-dialogue-maker-gender-male")}
        {:else}{getMessage("stardew-dialogue-maker-gender-any")}
        {/if}</button>
    </li>
    <li class="nav-item" role="presentation">
        <button class="nav-link" id="female-tab" data-bs-toggle="tab" data-bs-target="#female-{suffix}" type="button" role="tab" aria-controls="female" aria-selected="true" disabled={!hasFemale}>
        {getMessage("stardew-dialogue-maker-gender-female")}
        </button>
    </li>
    <li class="nav-item" role="presentation">
        <button class="nav-link" id="nonbinary-tab" data-bs-toggle="tab" data-bs-target="#nonbinary-{suffix}" type="button" role="tab" aria-controls="nonbinary" aria-selected="true" disabled={!hasNonbinary} autocomplete="off">
        {getMessage("stardew-dialogue-maker-gender-nonbinary")}
        </button>
    </li>
  </ul>
  
  <!-- Tab panes -->
  <div class="tab-content">
    <div class="tab-pane active" id="male-{suffix}" role="tabpanel" aria-labelledby="male-tab" tabindex="0">
        <StardewBox bind:text={message.male.text} bind:expression={message.male.expression} />
    </div>
    <div class="tab-pane" id="female-{suffix}" role="tabpanel" aria-labelledby="female-tab" tabindex="0">
        <StardewBox bind:text={message.female.text} bind:expression={message.female.expression} />
    </div>
    <div class="tab-pane" id="nonbinary-{suffix}" role="tabpanel" aria-labelledby="nonbinary-tab" tabindex="0">
        <StardewBox bind:text={message.nonbinary.text} bind:expression={message.nonbinary.expression} />
    </div>

  </div>
  