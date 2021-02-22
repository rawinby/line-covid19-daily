<!DOCTYPE html>
<html lang="en">

<head>
    <script type="text/javascript">
        var base_url = '<?php echo base_url(); ?>';
        var fetch_class = '<?php echo $fetch_class; ?>';
        var fetch_method = '<?php echo $fetch_method; ?>';
    </script>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <meta property="og:title" content="<?php echo $this->config->item('og_title');?>" />
    <meta property="og:description" content="<?php echo $this->config->item('og_title');?>" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="<?php echo base_url(); ?>" />
    <meta property="og:image" content="<?php echo $this->config->item('og_image'); ?>" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:width" content="700" />
    <meta property="og:image:height" content="500" />
    <title><?php echo $page_title;?></title>
    <link rel="shortcut icon" href="<?php echo base_url('assets/images/logo.png');?>">
    <link rel="stylesheet" type="text/css" href="<?php echo base_url('assets/css/fontawesome-all.css');?>">
    <link rel="stylesheet" type="text/css" href="<?php echo base_url('assets/css/font-material-icon.css');?>">
    <!-- <link rel="stylesheet" type="text/css" href="<?php echo base_url('assets/fonts/helvetica/helvetica.css');?>"> -->
    <link rel="stylesheet" type="text/css" href="<?php echo base_url('assets/css/font-kanit.css');?>">
    <link rel="stylesheet" type="text/css" href="<?php echo base_url('assets/css/bootstrap.min.css');?>">
    <link rel="stylesheet" type="text/css" href="<?php echo base_url('assets/css/loading.css');?>">
    <link rel="stylesheet" type="text/css" href="<?php echo base_url('assets/css/loading2.css');?>">
    <link rel="stylesheet" type="text/css" href="<?php echo base_url('assets/js/sweetalert2/sweetalert2.css');?>">
    <!-- less -->
    <link rel="stylesheet" href="<?php echo Less4ci::compile('map') ?>">
    <link rel="stylesheet" href="<?php echo Less4ci::compile('style') ?>">
    <!-- <link rel="stylesheet" href="<?php echo Less4ci::compile('style-responsive') ?>"> -->
    <link rel="stylesheet" href="<?php echo Less4ci::compile('print') ?>">

    
</head>

<body <?php echo !empty($body_class) ? 'class="'. $body_class .'"' : '';?>>



