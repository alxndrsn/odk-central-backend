# Match python version to pyodk's
FROM python:3.12

RUN apt-get update && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# TODO use specific pyodk version?
RUN pip install pyodk

COPY pyodk.conf.toml /src/ .

CMD [ "./run.sh" ]
