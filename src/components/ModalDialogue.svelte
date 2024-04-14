<script>
    export let showModal; // bool
    export let dialogue; // HTMLDialogElement

    $: if (dialogue && showModal) {
        if (!dialogue.open) {
            dialogue.showModal();
        }
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<dialog
    bind:this={dialogue}
    on:close={(e) => {showModal = false}}
    on:click|self={() => (dialogue.close())}
    class="stardew-text-box"
>
    <h1 class="stardew-text-scroll">
        <slot name="dialogue-header">Modal header</slot>
    </h1>
    <div id="dialogue-body">
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div on:click|stopPropagation class="container">
            <slot name="dialogue-body"></slot>
        </div>
    </div>
</dialog>