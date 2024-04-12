<script>
    export let hasFemale = false;
    export let hasNonbinary = false;
    export let suffix = "";
    export let getMessage; // i18n function
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
        <div class="stardew-text-box stardew-dialogue-layout p-1">
            <slot name="male">
                <p class="stardew-dialogue">Dialogue goes here...</p>
                <h2 class="stardew-expression">👀</h2>
            </slot>
            
        </div>
        <div class="d-grid">
        </div>
    </div>
    <div class="tab-pane" id="female-{suffix}" role="tabpanel" aria-labelledby="female-tab" tabindex="0">
        <div class="stardew-text-box stardew-dialogue-layout p-1">
            <slot name="female">
                <p class="stardew-dialogue">Dialogue goes here...</p>
                <h2 class="stardew-expression">👀</h2>
            </slot>
        </div>
    </div>
    <div class="tab-pane" id="nonbinary-{suffix}" role="tabpanel" aria-labelledby="nonbinary-tab" tabindex="0">
        <div class="stardew-text-box stardew-dialogue-layout p-1">
            <slot name="nonbinary">
                <p class="stardew-dialogue">Dialogue goes here...</p>
                <h2 class="stardew-expression">👀</h2>
            </slot>
        </div>
    </div>

  </div>
  