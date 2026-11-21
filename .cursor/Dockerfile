FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive
ARG NODE_VERSION=24.22.3
ARG POPPLER_VERSION=26.11.0

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        ca-certificates \
        curl \
        git \
        xz-utils \
        cmake \
        g++ \
        make \
        pkg-config \
        libfreetype6-dev \
        libfontconfig1-dev \
        libjpeg-dev \
        libpng-dev \
        libopenjp2-7-dev \
        libharfbuzz-dev \
        zlib1g-dev \
        libbrotli-dev \
    && rm -rf /var/lib/apt/lists/* \
    && curl -fsSL "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz" \
        | tar -xJ -C /usr/local --strip-components=1 --no-same-owner \
    && corepack enable \
    && curl -fsSL -o /tmp/poppler.tar.xz "https://poppler.freedesktop.org/poppler-${POPPLER_VERSION}.tar.xz" \
    && curl -fsSL -o /tmp/poppler-data.tar.gz https://poppler.freedesktop.org/poppler-data-0.4.12.tar.gz \
    && tar -xf /tmp/poppler.tar.xz -C /tmp \
    && tar -xf /tmp/poppler-data.tar.gz -C /tmp \
    && cmake -S "/tmp/poppler-${POPPLER_VERSION}" -B /tmp/poppler-build \
        -DCMAKE_BUILD_TYPE=Release \
        -DCMAKE_INSTALL_PREFIX=/opt/poppler-26.11 \
        -DCMAKE_C_COMPILER=gcc \
        -DCMAKE_CXX_COMPILER=g++ \
        -DENABLE_QT5=OFF \
        -DENABLE_QT6=OFF \
        -DENABLE_GLIB=OFF \
        -DENABLE_GOBJECT_INTROSPECTION=OFF \
        -DENABLE_CPP=OFF \
        -DENABLE_BOOST=OFF \
        -DENABLE_GTK_DOC=OFF \
        -DENABLE_NSS3=OFF \
        -DENABLE_GPGME=OFF \
        -DENABLE_LCMS=OFF \
        -DENABLE_LIBCURL=OFF \
        -DENABLE_LIBTIFF=OFF \
        -DBUILD_GTK_TESTS=OFF \
        -DBUILD_QT5_TESTS=OFF \
        -DBUILD_QT6_TESTS=OFF \
        -DBUILD_CPP_TESTS=OFF \
    && cmake --build /tmp/poppler-build -j"$(nproc)" \
    && cmake --install /tmp/poppler-build \
    && make -C /tmp/poppler-data-0.4.12 install prefix=/opt/poppler-26.11 datadir=/opt/poppler-26.11/share \
    && echo /opt/poppler-26.11/lib > /etc/ld.so.conf.d/poppler-26.11.conf \
    && ldconfig \
    && printf 'export PATH="/usr/local/bin:/opt/poppler-26.11/bin:$PATH"\n' > /etc/profile.d/forsikringstolken-path.sh \
    && mkdir -p /usr/local/cargo/bin \
    && echo "Agent PATH searches /usr/local/cargo/bin before /exec-daemon/node." \
    && for cmd in node npm npx corepack; do ln -sfn "/usr/local/bin/$cmd" "/usr/local/cargo/bin/$cmd"; done \
    && for cmd in /opt/poppler-26.11/bin/*; do ln -sfn "$cmd" "/usr/local/bin/$(basename "$cmd")"; done \
    && rm -rf "/tmp/poppler-${POPPLER_VERSION}" /tmp/poppler-build /tmp/poppler-data-0.4.12 /tmp/poppler.tar.xz /tmp/poppler-data.tar.gz

USER ubuntu
