<?php
function getEnvironment() {
    $res = getenv('environment');
    return $res ? $res : "prod";
}
?>

<script>
    var ENVIRONMENT = "<?php echo getEnvironment() ?>";
</script>

<?php include_once("index_.html"); ?>