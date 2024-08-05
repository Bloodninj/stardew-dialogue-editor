<script lang="ts">
    export let text: string;
    export let expression: string;
</script>

<div class="stardew-text-box stardew-dialogue-layout p-1">
    <p class="stardew-dialogue">{text}</p>
    <h2 class="stardew-expression">{expression}</h2>
</div>