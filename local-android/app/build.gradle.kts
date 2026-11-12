plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}
android {
    namespace = "cl.morrison.local"
    compileSdk = 35
    defaultConfig {
        applicationId = "cl.morrison.local"
        minSdk = 28
        targetSdk = 35
        versionCode = 1
        versionName = "3.0.0-local"
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions { jvmTarget = "17" }
    buildTypes {
        release { isMinifyEnabled = false }
    }
    packaging {
        jniLibs.useLegacyPackaging = true
    }
}
dependencies {
    implementation("androidx.webkit:webkit:1.14.0")
    implementation("dev.ffmpegkit-maintained:llama-android:0.1.1")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.10.2")
}